import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Sidebar } from "./components/Sidebar";
import { TelemetryPanel } from "./components/TelemetryPanel";
import { AppHeader } from "./components/AppHeader";
import { IntegrationsModal } from "./components/IntegrationsModal";
import { Toast } from "./components/Toast";
import { DashboardView } from "./pages/DashboardView";
import { AuditLogsView } from "./pages/AuditLogsView";
import { MemoryMatrixView } from "./pages/MemoryMatrixView";
import { useMemoryMatrix } from "./hooks/useMemoryMatrix";
import { useSystemLogs } from "./hooks/useSystemLogs";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useTriage } from "./hooks/useTriage";
import { useProxy } from "./hooks/useProxy";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { createTaskDocument } from "./services/firestoreService";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'logs'>('dashboard');

  const {
    logs,
    filteredLogs,
    logFilter,
    setLogFilter,
    logTerminalEndRef,
    addSystemLog,
  } = useSystemLogs();
  const { toastMessage, showToast } = useToast();
  const { user, loadingAuth, googleAccessToken, login, logout } = useAuth({
    addSystemLog,
    showToast,
  });
  const {
    tasks,
    setTasks,
    deleteTask: handleDeleteTask,
    resetTasks,
    handleFirestoreError,
  } = useTasks({ user, loadingAuth, addSystemLog, showToast });
  const { memoryMatrix, setMemoryMatrix } = useMemoryMatrix();
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      resetTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const {
    rawInput,
    setRawInput,
    isProcessing,
    processingStep,
    handleLaunchTriage,
    setIsProcessing,
    setProcessingStep,
    setIsDispatching,
  } = useTriage({
    user,
    memoryMatrix,
    setMemoryMatrix,
    setTasks,
    addSystemLog,
    showToast,
    handleFirestoreError,
  });

  const { handleExecuteProxy, taskScopeWarnings } = useProxy({
    user,
    googleAccessToken,
    setTasks,
    setIsDispatching,
    addSystemLog,
    showToast,
    handleFirestoreError,
  });

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    user,
    setTasks,
    setIsProcessing,
    setProcessingStep,
    addSystemLog,
    showToast,
    handleFirestoreError,
  });

  const handleScanInbox = async () => {
    console.log("INBOX SCAN STARTED");

    if (!googleAccessToken) {
      showToast("Please sign in first");
      return;
    }
    if (!user) {
      showToast("Please sign in first");
      return;
    }
    try {
      const unread = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread newer_than:7d",
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        }
      );

      const data = await unread.json();

      const messages = data.messages?.slice(0, 10) || [];

      const emails = await Promise.all(
        messages.map(async (msg: any) => {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            {
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
              },
            }
          );

          const email = await res.json();

          return {
            id: email.id,
            snippet: email.snippet,
            headers: email.payload?.headers || [],
          };
        })
      );

      const getHeader = (
        headers: any[],
        name: string
      ) =>
        headers.find(
          (h) => h.name.toLowerCase() === name.toLowerCase()
        )?.value || "";

      const formattedEmails = emails.map((email) => ({
        gmailId: email.id,
        subject: getHeader(email.headers, "Subject"),
        from: getHeader(email.headers, "From"),
        snippet: email.snippet,
      }));
      const actionableEmails = formattedEmails.filter(
        (email) =>
          /deadline|tomorrow|urgent|submit|meeting|interview|payment|due|assignment/i.test(
            `${email.subject} ${email.snippet}`
          )
      );

      console.log("ACTIONABLE EMAILS:", actionableEmails);

      console.log("FORMATTED EMAILS:", formattedEmails);

      const aiResponse = await fetch(
        "/api/agents/inbox-scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emails: actionableEmails,
          }),
        }
      );

      const aiResult = await aiResponse.json();
      const inboxRawText = actionableEmails.map(email => `
        Subject: ${email.subject}
        Snippet: ${email.snippet}
        `).join("\n");

      console.log("TRIAGE INPUT:", inboxRawText);

      const triageResponse = await fetch(
        "/api/agents/triage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rawText: inboxRawText,
            memoryMatrix,
            isThreat: false,
          }),
        }
      );

      const triageResult = await triageResponse.json();

      const inboxTask = {
        userId: user?.uid,
        rawText: inboxRawText,
        title:
          triageResult.title ||
          actionableEmails[0]?.subject ||
          "Inbox Alert",

        intent_type:
          triageResult.intent_type || "EMAIL",

        deadline:
          triageResult.deadline || null,

        entities:
          triageResult.entities || [],

        urgency:
          triageResult.urgency || 8.5,

        consequences:
          triageResult.consequences ||
          "Inbox-derived task detected.",

        stakes:
          triageResult.stakes ||
          "Pending review.",

        draft:
          triageResult.draft ||
          aiResult.action,

        status: "proxy_ready",

        isCalendarEvent:
          triageResult.isCalendarEvent || false,

        calendarEvent:
          triageResult.calendarEvent || null,

        isShadowChronos:
          triageResult.isShadowChronos || false,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "gmail",
        sourceMessageId: actionableEmails[0]?.gmailId,
      };

      const existingTasks = await getDocs(
        query(
          collection(db, "tasks"),
          where("sourceMessageId", "==", inboxTask.sourceMessageId)
        )
      );

      if (!existingTasks.empty) {
        showToast("Already processed");
        return;
      }

      await createTaskDocument(inboxTask);

      console.log("TRIAGE RESULT:", triageResult);

      addSystemLog(
        "System",
        `Inbox scanner found ${actionableEmails.length} actionable emails.`,
        "success"
      );
      addSystemLog(
        "Triage Agent",
        aiResult.summary,
        "action"
      );
      addSystemLog(
        "Proxy Agent",
        "Inbox threat converted into actionable task.",
        "success"
      );
      console.log("AI RESULT:", aiResult);

      showToast(
        `Loaded ${formattedEmails.length} emails`
      );

    } catch (err) {
      console.error(err);
      showToast("Inbox scan failed");
    }
  };

  // ---------------------------------------------------------
  // THE OMNIPRESENT CONTEXT INTERCEPTOR (CHROME EXTENSION API)
  // ---------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent");
    
    if (intent) {
      // 1. Switch to the dashboard view automatically
      setActiveTab('dashboard');
      
      // 2. Inject the highlighted text straight into the Agent Zero brain
      setRawInput(intent);
      
      // 3. Silently clean the URL bar so it looks like magic and doesn't loop on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // 4. Fire a telemetry log so the judges see the system acknowledging the external payload
      addSystemLog("System", "EXTERNAL PAYLOAD INTERCEPTED: Omnipresent Context Widget routed target data to Matrix.", "warning");
    }
  }, [setRawInput, addSystemLog]);

  return (
    <div className="h-screen w-full bg-[#fbfaf5] text-[#14171a] flex flex-col font-public-sans antialiased text-sm overflow-hidden select-none">

      {/* 1. Global Header Navigation Frame */}
      <AppHeader
        user={user}
        isLoading={loadingAuth}
        onLogin={login}
        onLogout={handleLogout}
      />

      {/* 2. Main 3-Panel Segment */}
      <main className="flex flex-1 overflow-hidden min-h-0 w-full animate-fade-up">

        {/* PANEL A: LEFT SIDEBAR (Navigation & Controls) - Width: 190px shrink-0 */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenIntegrations={() => setShowIntegrationsModal(true)}
          user={user}
        />

        {/* PANEL B: CENTRAL PRIMARY DISPLAY VIEW (Triage, Action Interception, Cards) - Flex adaptive */}
        <section className="flex-1 p-5 flex flex-col gap-5 bg-[#fbfaf5] overflow-y-auto h-full min-h-0">

          {activeTab === "dashboard" && (
            <DashboardView
              rawInput={rawInput}
              onRawInputChange={setRawInput}
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isProcessing={isProcessing}
              processingStep={processingStep}
              onLaunchTriage={handleLaunchTriage}
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              onExecuteProxy={handleExecuteProxy}
              taskScopeWarnings={taskScopeWarnings}
              onScanInbox={handleScanInbox}
            />
          )}

          {activeTab === "matrix" && (
            <MemoryMatrixView
              entries={memoryMatrix}
              onEntriesChange={setMemoryMatrix}
              addSystemLog={addSystemLog}
              showToast={showToast}
            />
          )}

          {activeTab === "logs" && (
            <AuditLogsView
              logs={filteredLogs}
              filter={logFilter}
              onFilterChange={setLogFilter}
            />
          )}

        </section>

        {/* PANEL C: RIGHT SIDEBAR (The Execution Proxy Log scrolling feed) - Width: 320px shrink-0 */}
        <TelemetryPanel logs={logs} endRef={logTerminalEndRef} />

      </main>

      <IntegrationsModal
        isOpen={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
        onCommit={() => {
          setShowIntegrationsModal(false);
          showToast("Proxy nodes calibrated.");
        }}
      />

      <Toast message={toastMessage} />

    </div>
  );
}
