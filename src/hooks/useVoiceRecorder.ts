import { useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "firebase/auth";
import { isFirestoreEnabled } from "../firebase";
import type { Task } from "../types";
import { createTaskDocument, OperationType } from "../services/firestoreService";
import type { AddSystemLog } from "./useSystemLogs";

interface UseVoiceRecorderOptions {
  user: User | null;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setProcessingStep: Dispatch<SetStateAction<number>>;
  addSystemLog: AddSystemLog;
  showToast: (message: string) => void;
  handleFirestoreError: (
    error: unknown,
    operationType: OperationType,
    path: string | null,
  ) => void;
}

export function useVoiceRecorder({
  user,
  setTasks,
  setIsProcessing,
  setProcessingStep,
  addSystemLog,
  showToast,
  handleFirestoreError,
}: UseVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const startRecording = async () => {
    try {
      addSystemLog('System', 'Requesting microphone access permissions...', 'action');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        addSystemLog('System', 'Audio captured. Routing to voice processing engine...', 'action');
        setIsProcessing(true);
        setProcessingStep(1);

        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onerror = () => {
          setIsProcessing(false);
          setProcessingStep(0);
          addSystemLog('System', 'Audio encoding failure. FileReader aborted.', 'warning');
          showToast('Failed to process audio locally.');
        };

        reader.onloadend = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            
            const response = await fetch("https://agent-zero-backend.onrender.com/api/agents/voice", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                audio: base64data,
                mimeType: "audio/webm"
              })
            });

            addSystemLog('System', `API REQUEST: [POST /api/agents/voice] -> status: ${response.status}`, response.ok ? 'success' : 'warning');

            if (!response.ok) {
              throw new Error(`Voice processing server returned error code ${response.status}.`);
            }

            const agentResult = await response.json();
            setProcessingStep(4);

            const determinedIntentType = agentResult.intent_type || 
              ((agentResult.isShadowChronos || (agentResult.urgency && agentResult.urgency >= 8.5)) 
                ? 'THREAT' 
                : (agentResult.isCalendarEvent ? 'CALENDAR' : 'EMAIL'));

            const newTask: Task = {
              id: "task_" + Date.now(),
              userId: user ? user.uid : null,
              rawText: "[Audio Input Processed]",
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
                  calendarEvent: newTask.calendarEvent || undefined,
                  isShadowChronos: newTask.isShadowChronos || false,
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
              setIsProcessing(false);
              setProcessingStep(0);
              showToast("Voice transcription and triage completed successfully.");
            }, 1000);

          } catch (err: any) {
            console.error("Voice Processing Error:", err);
            setIsProcessing(false);
            setProcessingStep(0);
            addSystemLog('System', `Audio processing or transcription failed.`, 'warning');
            showToast(`Voice capture error: ${err.message || 'Processing failed'}`);
          }
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      addSystemLog('System', 'Audio recording active...', 'info');
    } catch (err: any) {
      console.error("Microphone Access Error:", err);
      addSystemLog('System', 'Microphone access denied or unavailable.', 'warning');
      showToast("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, startRecording, stopRecording };
}