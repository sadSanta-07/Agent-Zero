import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase"
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
import { BootSequence } from "./components/BootSequence";

export default function App() {
  const [hasBooted, setHasBooted] = useState(() => {
    return sessionStorage.getItem("agent_zero_booted") === "true";
  });
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

    if (!googleAccessToken || !user) {
      showToast("Authentication required to scan inbox.");
      return;
    }

    try {
      showToast("Initiating Inbox Analysis...");

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

      const getHeader = (headers: any[], name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

      const formattedEmails = emails.map((email) => ({
        gmailId: email.id,
        subject: getHeader(email.headers, "Subject"),
        from: getHeader(email.headers, "From"),
        snippet: email.snippet,
      }));

      const actionableEmails = formattedEmails.filter((email) =>
        /deadline|tomorrow|urgent|submit|meeting|interview|payment|due|assignment/i.test(
          `${email.subject} ${email.snippet}`
        )
      );

      console.log("ACTIONABLE EMAILS:", actionableEmails);
      console.log("FORMATTED EMAILS:", formattedEmails);

      const aiResponse = await fetch("https://agent-zero-backend.onrender.com/api/agents/inbox-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: actionableEmails }),
      });

      const aiResult = await aiResponse.json();
      const inboxRawText = actionableEmails.map(email => `
        Subject: ${email.subject}
        Snippet: ${email.snippet}
      `).join("\n");

      console.log("TRIAGE INPUT:", inboxRawText);

      const triageResponse = await fetch("https://agent-zero-backend.onrender.com/api/agents/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: inboxRawText,
          memoryMatrix,
          isThreat: false,
        }),
      });

      const triageResult = await triageResponse.json();

      const inboxTask = {
        userId: user?.uid,
        rawText: inboxRawText,
        title: triageResult.title || actionableEmails[0]?.subject || "Inbox Action Item",
        intent_type: triageResult.intent_type || "EMAIL",
        deadline: triageResult.deadline || null,
        entities: triageResult.entities || [],
        urgency: triageResult.urgency || 8.5,
        consequences: triageResult.consequences || "Inbox-derived task detected.",
        stakes: triageResult.stakes || "Pending review.",
        draft: triageResult.draft || aiResult.action,
        status: "proxy_ready" as const,
        isCalendarEvent: triageResult.isCalendarEvent || false,
        calendarEvent: triageResult.calendarEvent || null,
        isShadowChronos: triageResult.isShadowChronos || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "gmail" as const,
        sourceMessageId: actionableEmails[0]?.gmailId,
      };

      const existingTasks = await getDocs(
        query(
          collection(db, "tasks"),
          where("sourceMessageId", "==", inboxTask.sourceMessageId)
        )
      );

      if (!existingTasks.empty) {
        showToast("Task already processed from this thread.");
        return;
      }

      await createTaskDocument(inboxTask);

      console.log("TRIAGE RESULT:", triageResult);

      addSystemLog("System", `Inbox analysis identified ${actionableEmails.length} actionable items.`, "success");
      addSystemLog("Triage Agent", aiResult.summary, "action");
      addSystemLog("Proxy Agent", "External communication converted into structured task workflow.", "success");

      console.log("AI RESULT:", aiResult);
      showToast(`Analyzed ${formattedEmails.length} recent communications.`);

    } catch (err) {
      console.error(err);
      showToast("Inbox analysis failed. Please verify connection.");
    }
  };

  // ---------------------------------------------------------
  // THE OMNIPRESENT CONTEXT INTERCEPTOR (CHROME EXTENSION API)
  // ---------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent");

    if (intent) {
      setActiveTab('dashboard');
      setRawInput(intent);
      window.history.replaceState({}, document.title, window.location.pathname);
      addSystemLog("System", "External context payload successfully mapped to task input.", "warning");
    }
  }, [setRawInput, addSystemLog]);

  // ---------------------------------------------------------
  // EFFICIENCY INDEX CALCULATION
  // ---------------------------------------------------------
  const efficiencyIndex = useMemo(() => {
    if (!user) return null;
    if (!tasks || tasks.length === 0) return 100.0;

    const completedTasks = tasks.filter(
      (task) => task.status === "executed"
    ).length;

    const totalTasks = tasks.length;
    const completionRatio = completedTasks / totalTasks;

    return 75.0 + (completionRatio * 25.0);
  }, [tasks, user]);

  if (!hasBooted) {
    return (
      <BootSequence
        onComplete={(selectedPrompt) => {
          if (selectedPrompt) {
            setRawInput(selectedPrompt);
          }
          sessionStorage.setItem("agent_zero_booted", "true");
          setHasBooted(true);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-brand-bg text-brand-text-primary flex flex-col font-public-sans antialiased text-[14px] overflow-hidden">

      {/* 1. Global Header Navigation Frame */}
      <AppHeader
        user={user}
        isLoading={loadingAuth}
        onLogin={login}
        onLogout={handleLogout}
        efficiencyIndex={efficiencyIndex}
      />

      {/* 2. Main 3-Panel Segment */}
      <main className="flex flex-1 overflow-hidden min-h-0 w-full animate-fade-up">

        {/* PANEL A: LEFT SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenIntegrations={() => setShowIntegrationsModal(true)}
          user={user}
        />

        {/* PANEL B: CENTRAL PRIMARY DISPLAY VIEW */}
        <section className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-brand-bg overflow-y-auto h-full min-h-0">
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

        <TelemetryPanel logs={logs} endRef={logTerminalEndRef} />

      </main>

      {/* Modals & Toasts */}
      <IntegrationsModal
        isOpen={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
        onCommit={() => {
          setShowIntegrationsModal(false);
          showToast("Proxy nodes successfully synchronized.");
        }}
      />

      <Toast message={toastMessage} />

    </div>
  );
}