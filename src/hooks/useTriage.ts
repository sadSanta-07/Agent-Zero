import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type { User } from "firebase/auth";
import { isFirestoreEnabled } from "../firebase";
import type { MemoryEntity, Task } from "../types";
import { createTaskDocument, OperationType } from "../services/firestoreService";
import type { AddSystemLog } from "./useSystemLogs";

interface UseTriageOptions {
  user: User | null;
  memoryMatrix: MemoryEntity[];
  setMemoryMatrix: Dispatch<SetStateAction<MemoryEntity[]>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  addSystemLog: AddSystemLog;
  showToast: (message: string) => void;
  handleFirestoreError: (
    error: unknown,
    operationType: OperationType,
    path: string | null,
  ) => void;
}

export function useTriage({
  user,
  memoryMatrix,
  setMemoryMatrix,
  setTasks,
  addSystemLog,
  showToast,
  handleFirestoreError,
}: UseTriageOptions) {
  const [rawInput, setRawInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // 6. Action: Multi-Agent Triage Pipeline Initiation
  const handleLaunchTriage = async (e: FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;
    if (isProcessing) return;

    const userInput = rawInput.trim();
    setRawInput("");
    setIsProcessing(true);
    setIsDispatching(true);
    setProcessingStep(1);

    addSystemLog('Triage Agent', `Processing input workflow: "${userInput}"`, 'action');

    const step1Timer = setTimeout(() => {
      setProcessingStep(2);
      addSystemLog('Calibrator Agent', `Evaluating priority indices and projected impact...`, 'action');
    }, 1400);

    const step2Timer = setTimeout(() => {
      setProcessingStep(3);
      addSystemLog('Proxy Agent', `Drafting automated execution workflow...`, 'action');
    }, 2800);

    const isThreat = /ignore|tomorrow|postpone|later|too tired|skip/i.test(userInput);

    try {
      // Trigger API endpoint on Node Express backend
      const response = await fetch("/api/agents/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rawText: userInput, memoryMatrix, isThreat })
      });

      addSystemLog('System', `API REQUEST: [POST /api/agents/triage] -> status: ${response.status}`, response.ok ? 'success' : 'warning');

      if (!response.ok) {
        throw new Error(`Triage pipeline server returned error code ${response.status}.`);
      }

      const agentResult = await response.json();
      
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setProcessingStep(4);

      if (agentResult.extractedEntities && Array.isArray(agentResult.extractedEntities)) {
        setMemoryMatrix((prev) => {
          const updated = [...prev];
          agentResult.extractedEntities.forEach((ent: any) => {
            if (ent && ent.key && ent.value) {
              const keyNorm = ent.key.trim().toLowerCase();
              const valNorm = ent.value.trim().toLowerCase();
              const exists = updated.some(
                (item) => item.key.trim().toLowerCase() === keyNorm && item.value.trim().toLowerCase() === valNorm
              );
              if (!exists) {
                updated.push({
                  id: "mem_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                  type: ent.type || 'Entity',
                  key: ent.key.trim(),
                  value: ent.value.trim(),
                  timestamp: new Date().toISOString()
                });
                addSystemLog('System', `Entity Resolution: Mapped [${ent.type || 'Entity'}] -> "${ent.key}" to "${ent.value}"`, 'success');
              }
            }
          });
          localStorage.setItem("memoryMatrix", JSON.stringify(updated));
          return updated;
        });
      }

      const determinedIntentType = agentResult.intent_type || 
        ((agentResult.isShadowChronos || (agentResult.urgency && agentResult.urgency >= 8.5)) 
          ? 'THREAT' 
          : (agentResult.isCalendarEvent ? 'CALENDAR' : 'EMAIL'));

      const newTask: Task = {
        id: "task_" + Date.now(),
        userId: user ? user.uid : null,
        rawText: userInput,
        title: agentResult.title,
        intent_type: determinedIntentType,
        deadline: agentResult.deadline,
        entities: agentResult.entities || [],
        urgency: determinedIntentType === 'THREAT' ? Math.max(9.5, agentResult.urgency || 9.5) : (agentResult.urgency || 7.0),
        consequences: agentResult.consequences,
        stakes: agentResult.stakes,
        draft: agentResult.draft,
        status: 'proxy_ready',
        isCalendarEvent: !!agentResult.isCalendarEvent,
        calendarEvent: agentResult.calendarEvent || undefined,
        isShadowChronos: determinedIntentType === 'THREAT' || !!agentResult.isShadowChronos,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (newTask.intent_type === 'THREAT') {
        addSystemLog('System', '[ROUTING DECISION]: CRITICAL PRIORITY', 'warning');
        addSystemLog('System', '[URGENCY INDEX CALIBRATED]: 9.5', 'warning');
      }

      if (agentResult.thoughts && Array.isArray(agentResult.thoughts)) {
        agentResult.thoughts.forEach((thought: string, idx: number) => {
          let agent: 'System' | 'Triage Agent' | 'Calibrator Agent' | 'Proxy Agent' = 'Triage Agent';
          if (thought.includes("Calibrator")) agent = 'Calibrator Agent';
          else if (thought.includes("Proxy")) agent = 'Proxy Agent';
          else if (thought.includes("System") || thought.includes("SHADOW CHRONOS") || thought.includes("MITIGATION")) agent = 'System';
          
          setTimeout(() => {
            addSystemLog(agent, thought.replace(/\[.*?\]\s*/g, ''), 'info');
          }, idx * 400);
        });
      }

      if (user && isFirestoreEnabled) {
        try {
          await createTaskDocument({
            userId: user.uid,
            rawText: newTask.rawText,
            title: newTask.title,
            intent_type: newTask.intent_type,
            deadline: newTask.deadline,
            entities: newTask.entities,
            urgency: newTask.urgency,
            consequences: newTask.consequences,
            stakes: newTask.stakes,
            draft: newTask.draft,
            status: newTask.status,
            isCalendarEvent: newTask.isCalendarEvent,
            isShadowChronos: newTask.isShadowChronos || false,
            calendarEvent: newTask.calendarEvent || null,
            createdAt: newTask.createdAt,
            updatedAt: newTask.updatedAt
          });
          addSystemLog('System', `Database Sync: Task successfully committed to cloud storage [User: ${user.uid.slice(0,6)}]`, 'success');
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, "tasks");
          addSystemLog('System', `System Fallback: Appending newly drafted task to local storage due to write error.`, 'warning');
          setTasks((prev) => [newTask, ...prev]);
        }
      } else {
        setTasks((prev) => [newTask, ...prev]);
        addSystemLog('System', `System Fallback: Task committed to local storage.`, 'success');
      }

      setTimeout(() => {
        showToast("Automated triage complete. Workflow ready for review.");
      }, 300);

    } catch (err: any) {
      console.error("Triage Pipeline Error:", err);
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      addSystemLog('System', `Pipeline execution failed: ${err instanceof Error ? err.message : String(err)}`, 'warning');
      showToast("Pipeline timeout. Task generation failed.");
    } finally {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setIsProcessing(false);
      setIsDispatching(false);
      setProcessingStep(0);
      addSystemLog('System', 'Pipeline execution thread finalized.', 'success');
    }
  };

  return {
    rawInput,
    setRawInput,
    isProcessing,
    processingStep,
    handleLaunchTriage,
    setIsProcessing,
    setProcessingStep,
    setIsDispatching,
  };
}