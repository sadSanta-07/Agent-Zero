import { useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "firebase/auth";
import { isFirestoreEnabled } from "../firebase";
import type { Task } from "../types";
import { createRawEmail, parseEmailDraft } from "../services/email";
import { OperationType, updateTaskDocument } from "../services/firestoreService";
import type { AddSystemLog } from "./useSystemLogs";
import { generatePrepDoc } from "../services/googleDocsService";

interface UseProxyOptions {
  user: User | null;
  googleAccessToken: string | null;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  setIsDispatching: Dispatch<SetStateAction<boolean>>;
  addSystemLog: AddSystemLog;
  showToast: (message: string) => void;
  handleFirestoreError: (
    error: unknown,
    operationType: OperationType,
    path: string | null,
  ) => void;
}

export function useProxy({
  user,
  googleAccessToken,
  setTasks,
  setIsDispatching,
  addSystemLog,
  showToast,
  handleFirestoreError,
}: UseProxyOptions) {
  const [taskScopeWarnings, setTaskScopeWarnings] = useState<Record<string, string>>({});

  const updateLocalTaskState = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() } as Task
          : t
      )
    );
  };

  const clearTaskWarning = (taskId: string) => {
    setTaskScopeWarnings((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const setTaskWarning = (taskId: string, message: string) => {
    setTaskScopeWarnings((prev) => ({ ...prev, [taskId]: message }));
  };

const resolveContactEmail = (rawTo: string, fullDraft?: string, task?: Task) => {
    let cleanName = (rawTo || "").replace(/[[\]'"]/g, '').trim();

    if (!cleanName && fullDraft) {
      const emailRegexMatch = fullDraft.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailRegexMatch) cleanName = emailRegexMatch[0];
    }

    const isGeneric = !cleanName || cleanName === 'team@company.com' || cleanName === 'operator@internal.system' || cleanName === 'placeholder@example.com' || cleanName.includes('Pending');

    try {
      // Search the title, the AI-extracted entities, AND the raw text
      const searchString = `${cleanName} ${task?.title || ""} ${task?.entities?.join(" ") || ""} ${fullDraft || ""}`.toLowerCase();
      const words = searchString.split(/[\s,.]+/);

      for (let i = 0; i < localStorage.length; i++) {
        const val = localStorage.getItem(localStorage.key(i) || "");
        if (val && val.includes('resolvedValue')) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              const match = parsed.find((item: any) => 
                words.includes((item?.shortcode || "").toLowerCase()) || 
                words.includes((item?.key || "").toLowerCase())
              );
              if (match && match.resolvedValue && match.resolvedValue.includes('@')) {
                return match.resolvedValue;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    if (cleanName.includes('@') && !isGeneric) return cleanName;
    return "operator@internal.system";
  };

  const handleExecuteProxy = async (task: Task) => {
    setIsDispatching(true);
    addSystemLog('Proxy Agent', `Executing authorized dispatch for target: "${task.title}"`, 'action');

    if (task.intent_type === 'THREAT' || (task.urgency && task.urgency >= 8.5)) {
      addSystemLog('System', '[ROUTING DECISION]: CRITICAL PRIORITY', 'warning');
      addSystemLog('System', `[URGENCY INDEX]: ${(task.urgency || 9.5).toFixed(1)}`, 'warning');
    }

    try {
      const activeToken = localStorage.getItem('google_oauth_token') || localStorage.getItem('google_access_token') || googleAccessToken;

      // ---------------------------------------------------------
      // BRANCH A: MULTI-CHANNEL MITIGATION (Shadow Chronos)
      // ---------------------------------------------------------
      if (task.isShadowChronos) {
        addSystemLog('Proxy Agent', `DEPLOYING MULTI-CHANNEL MITIGATION: Engaging dual-workflow resolution...`, 'action');

        if (activeToken) {
          try {
            addSystemLog('Proxy Agent', `Initiating simultaneous Gmail & Calendar REST dispatches...`, 'action');

            const parsedEmail = task.draft ? parseEmailDraft(task.draft) : { to: "", subject: `Automated Update: ${task.title}`, body: "Automated mitigation deployed." };

            const safeRecipient = resolveContactEmail(parsedEmail.to, task.draft, task); 
            const emailContent = createRawEmail(safeRecipient, "me", parsedEmail.subject, parsedEmail.body);

            const gmailPromise = fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${activeToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ raw: emailContent })
            });

            const calendarPromise = fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${activeToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                summary: task.calendarEvent?.title || `Automated Remediation: ${task.title}`,
                description: task.calendarEvent?.description || "Automated schedule adjustment to bypass task conflict.",
                start: { dateTime: task.calendarEvent?.startTime || new Date(Date.now() + 15 * 60 * 1000).toISOString() },
                end: { dateTime: task.calendarEvent?.endTime || new Date(Date.now() + 45 * 60 * 1000).toISOString() }
              })
            });

            const [gmailResponse, calendarResponse] = await Promise.all([gmailPromise, calendarPromise]);
            addSystemLog('System', `API DISPATCH: [Gmail] -> status: ${gmailResponse.status} // [Calendar] -> status: ${calendarResponse.status}`, 'success');

            if (gmailResponse.status === 401 || calendarResponse.status === 401) {
              setTaskWarning(task.id, "Workspace Authorization Expired. Please sign in again.");
              throw new Error("UNAUTHORIZED_401");
            }
            if (!gmailResponse.ok || !calendarResponse.ok) {
              if (gmailResponse.status === 403 || calendarResponse.status === 403) {
                setTaskWarning(task.id, "Workspace Authorization Expired. Please sign out and sign back in to grant permissions.");
              }
              throw new Error(`Dual dispatch status: Gmail (${gmailResponse.status}), Calendar (${calendarResponse.status})`);
            }

            clearTaskWarning(task.id);

            let prepDocUrl: string | undefined;
            if (task.isCalendarEvent) {
              prepDocUrl = (await generatePrepDoc(
                activeToken,
                task.calendarEvent?.title || task.title,
                task.calendarEvent?.description || ""
              )) || undefined;
            }

            addSystemLog('System', `MULTI-CHANNEL MITIGATION DEPLOYED. WORKSPACE ALIGNMENT COMPLETE.`, 'success');

            const executionState = {
              status: 'executed' as const,
              prepDocUrl,
              isSmtpSimulated: false,
              isWorkspaceSynced: true,
              isAgentMatrixGateway: true,
              isNativeGmailApi: true,
              isCalendarSynced: true,
            };

            if (user && isFirestoreEnabled) {
              try {
                await updateTaskDocument(task.id, { ...executionState, updatedAt: new Date().toISOString() });
              } catch (dbErr) {
                updateLocalTaskState(task.id, executionState);
              }
            } else {
              updateLocalTaskState(task.id, executionState);
            }

            showToast("Multi-Channel mitigation deployed successfully.");

          } catch (err: any) {
            console.error("Multi-Channel Dispatch Error:", err);
            if (err.message !== "UNAUTHORIZED_401") {
              addSystemLog('Proxy Agent', `Workflow failure: ${err.message || 'unknown API error'}`, 'warning');
              showToast(`Dispatch failed: ${err.message || 'API error'}`);
            }
          }
        } else {
          setTaskWarning(task.id, "Workspace Authorization Expired. Please sign in again.");

          if (user) {
            throw new Error("Workspace Session Expired. Please sign in again.");
          } else {
            addSystemLog('Proxy Agent', `Simulating Multi-Channel Dual API dispatch...`, 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
            addSystemLog('System', `SIMULATION COMPLETE. WORKSPACE ALIGNMENT LOGGED.`, 'success');

            updateLocalTaskState(task.id, {
              status: 'executed',
              isSmtpSimulated: true,
              isWorkspaceSynced: false,
              isAgentMatrixGateway: true,
              isNativeGmailApi: true,
              isCalendarSynced: true,
            });
            showToast("Risk mitigation simulated successfully.");
          }
        }
        return;
      }

      // ---------------------------------------------------------
      // BRANCH B: STANDARD SINGLE-CHANNEL DISPATCH
      // ---------------------------------------------------------
      if (activeToken) {
        try {
          let response: Response;

          if (task.intent_type === 'CALENDAR' || task.isCalendarEvent) {
            addSystemLog('Proxy Agent', `Initiating Workspace Calendar API synchronization...`, 'action');
            response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${activeToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                summary: task.calendarEvent?.title || task.title,
                description: task.calendarEvent?.description || `Synchronized automated schedule reservation.`,
                start: { dateTime: task.calendarEvent?.startTime || new Date().toISOString() },
                end: { dateTime: task.calendarEvent?.endTime || new Date(Date.now() + 3600 * 1000).toISOString() }
              })
            });
          } else {
            addSystemLog('Proxy Agent', `Initiating Workspace Gmail API dispatch...`, 'action');
            const parsedEmail = task.draft ? parseEmailDraft(task.draft) : { to: "", subject: task.title, body: "Automated task execution." };

            const safeRecipient = resolveContactEmail(parsedEmail.to, task.draft, task);
            const emailContent = createRawEmail(safeRecipient, "me", parsedEmail.subject, parsedEmail.body);

            response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${activeToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ raw: emailContent })
            });
          }

          addSystemLog('System', `API RESPONSE: status ${response.status}`, response.ok ? 'success' : 'warning');

          if (response.status === 401) {
            setTaskWarning(task.id, "Workspace Authorization Expired. Please sign in again.");
            throw new Error("UNAUTHORIZED_401");
          }

          if (!response.ok) {
            if (response.status === 403) {
              setTaskWarning(task.id, "Workspace Authorization Expired. Please sign out and sign back in to grant permissions.");
            }
            const errData = await response.json().catch(() => ({ error: { message: `Google API responded with status ${response.status}` } }));
            throw new Error(errData.error?.message || `Google API status code ${response.status}`);
          }

          clearTaskWarning(task.id);

          let prepDocUrl: string | undefined;
          if (task.intent_type === 'CALENDAR' || task.isCalendarEvent) {
            const generatedPrepDocUrl = await generatePrepDoc(
              activeToken,
              task.calendarEvent?.title || task.title,
              task.calendarEvent?.description || ""
            );
            prepDocUrl = generatedPrepDocUrl ?? undefined;
          }

          const isCalAction = task.intent_type === 'CALENDAR' || task.isCalendarEvent;

          const executionState = {
            status: 'executed' as const,
            prepDocUrl,
            isSmtpSimulated: false,
            isWorkspaceSynced: true,
            isAgentMatrixGateway: false,
            isNativeGmailApi: !isCalAction,
            isCalendarSynced: !!isCalAction,
          };

          if (user && isFirestoreEnabled) {
            try {
              await updateTaskDocument(task.id, { ...executionState, updatedAt: new Date().toISOString() });
              addSystemLog('System', 'Data Pipeline: Updated execution ledger in cloud storage.', 'success');
            } catch (dbErr) {
              handleFirestoreError(dbErr, OperationType.UPDATE, `tasks/${task.id}`);
              addSystemLog('System', `FALLBACK: Updating local client ledger due to sync error.`, 'warning');
              updateLocalTaskState(task.id, executionState);
            }
          } else {
            updateLocalTaskState(task.id, executionState);
          }

          const successLogMsg = isCalAction
            ? `CALENDAR SECURED: "${task.calendarEvent?.title || task.title}". Synchronization successful.`
            : `DISPATCH SUCCESS: "${task.title}". Delivered securely via Native API.`;

          addSystemLog('Proxy Agent', successLogMsg, 'success');
          showToast(isCalAction ? "Event synchronized successfully." : "Dispatch successful.");

        } catch (err: any) {
          console.error("Standard Dispatch Error:", err);
          if (err.message !== "UNAUTHORIZED_401") {
            addSystemLog('Proxy Agent', `Execution failure: ${err.message || 'unknown API error'}`, 'warning');
            showToast(`Dispatch failed: ${err.message || 'API error'}`);
          }
        }
      } else {
        // ---------------------------------------------------------
        // BRANCH C: SIMULATION / GUEST MODE
        // ---------------------------------------------------------
        setTaskWarning(task.id, "Workspace Authorization Missing. Operating in Guest Simulation mode.");

        if (user) {
          throw new Error("Workspace Session Expired. Please sign in again.");
        } else {
          const isCal = task.intent_type === 'CALENDAR' || task.isCalendarEvent;
          addSystemLog('Proxy Agent', `Guest Mode active. Simulating API dispatch workflow...`, 'info');

          await new Promise(resolve => setTimeout(resolve, 800));

          updateLocalTaskState(task.id, {
            status: 'executed',
            isSmtpSimulated: !isCal,
            isWorkspaceSynced: false,
            isAgentMatrixGateway: false,
            isNativeGmailApi: false,
            isCalendarSynced: !!isCal,
          });

          addSystemLog('Proxy Agent', `DISPATCH SUCCESS: "${task.title}". [SIMULATED] Workflow executed via local relay.`, 'success');
          showToast(isCal ? "Event synchronized successfully (Simulated)." : "Execution dispatch initiated (Simulated).");
        }
      }
    } catch (err: any) {
      console.error("Proxy Hook Catch All:", err);
      addSystemLog('Proxy Agent', `Execution halted: ${err.message || 'unknown error'}`, 'warning');
    } finally {
      setIsDispatching(false);
      addSystemLog('System', 'Workflow execution thread finalized.', 'success');
    }
  };

  return { handleExecuteProxy, taskScopeWarnings };
}