import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Mic, MicOff, Plus, Loader2, Inbox } from "lucide-react";
import type { Task } from "../types";
import { CalendarCard, EmailProxyCard, ShadowChronosCard, AmbiguousChoiceCard } from "../components/TaskCards";

interface DashboardViewProps {
  rawInput: string;
  onRawInputChange: Dispatch<SetStateAction<string>>;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isProcessing: boolean;
  processingStep: number;
  onLaunchTriage: FormEventHandler<HTMLFormElement>;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onExecuteProxy: (task: Task) => Promise<void>;
  taskScopeWarnings: Record<string, string>;
  onScanInbox: () => Promise<void>;
}

export function DashboardView({
  rawInput,
  onRawInputChange: setRawInput,
  isRecording,
  onStartRecording: startRecording,
  onStopRecording: stopRecording,
  isProcessing,
  processingStep,
  onLaunchTriage: handleLaunchTriage,
  tasks,
  onDeleteTask: handleDeleteTask,
  onExecuteProxy: handleExecuteProxy,
  taskScopeWarnings,
  onScanInbox: handleScanInbox,
}: DashboardViewProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 min-h-0 h-auto lg:h-full">

      {/* Introduction header info */}
      <div className="flex flex-col gap-2 animate-fade-up shrink-0">
        <h2 className="font-fraunces text-[28px] sm:text-[32px] text-brand-text-primary leading-tight m-0">Triage Zone</h2>
        <p className="text-[14px] font-public-sans text-brand-text-secondary leading-relaxed max-w-3xl m-0">
          Input unstructured tasks, constraints, or objectives. The automated parser will structure workflows, calculate urgency indexes, and prepare execution drafts.
        </p>
      </div>

      {/* Primary Input Container */}
      <div className="bg-brand-surface border border-brand-border p-4 sm:p-5 rounded-[3px] animate-fade-up shadow-sm shrink-0">
        <form onSubmit={handleLaunchTriage} className="flex flex-col gap-4">

          <div className="flex flex-wrap justify-between items-center gap-2">
            <label className="text-[11px] uppercase tracking-widest font-space-mono font-bold text-brand-text-secondary">
              Task Input
            </label>
            <span className="text-[10px] font-space-mono font-medium text-brand-primary flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              System Ready
            </span>
          </div>

          {/* Textarea Wrapper */}
          <div className="relative">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='e.g., "Draft an update email to the client regarding the Q3 deliverables, but wait for my approval before sending..."'
              className="w-full min-h-28 sm:h-24 bg-brand-bg border border-brand-border p-3 pr-12 text-[14px] font-public-sans text-brand-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder-brand-text-secondary/60 rounded-xs transition-all-custom resize-y sm:resize-none shadow-inner"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-50 text-red-600 border border-red-200 p-2 rounded-xs hover:bg-red-100 hover:border-red-300 transition-all-custom flex items-center justify-center animate-pulse cursor-pointer shadow-sm"
                  title="Stop Voice Input"
                >
                  <MicOff className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary p-2 rounded-xs transition-all-custom flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  title="Begin Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                console.log("SCAN CLICKED");
                handleScanInbox();
              }}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface px-4 py-2 text-[13px] font-medium font-public-sans rounded-xs transition-all-custom flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Inbox className="w-4 h-4" />
              Analyze Inbox
            </button>

            <button
              type="submit"
              disabled={isProcessing || !rawInput.trim()}
              className={`w-full sm:w-auto text-[13px] font-medium font-public-sans px-5 py-2 rounded-xs transition-all-custom flex items-center justify-center gap-2 cursor-pointer ${!rawInput.trim() || isProcessing
                ? 'bg-brand-bg border border-brand-border text-brand-text-secondary/50 cursor-not-allowed'
                : 'bg-brand-primary text-brand-surface hover:bg-brand-hover border border-transparent shadow-sm'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Process Task</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Intelligent Agent Progress Stepper */}
        {isProcessing && (
          <div className="mt-4 border-t border-brand-border pt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="flex flex-col items-center text-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-space-mono font-bold transition-colors ${processingStep >= 1 ? 'bg-brand-primary text-brand-surface' : 'bg-brand-bg border border-brand-border text-brand-text-secondary'}`}>1</div>
              <span className={`text-[9px] sm:text-[10px] font-space-mono uppercase tracking-wider ${processingStep >= 1 ? 'text-brand-text-primary font-bold' : 'text-brand-text-secondary'}`}>Analysis</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-space-mono font-bold transition-colors ${processingStep >= 2 ? 'bg-brand-primary text-brand-surface' : 'bg-brand-bg border border-brand-border text-brand-text-secondary'}`}>2</div>
              <span className={`text-[9px] sm:text-[10px] font-space-mono uppercase tracking-wider ${processingStep >= 2 ? 'text-brand-text-primary font-bold' : 'text-brand-text-secondary'}`}>Calibration</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-space-mono font-bold transition-colors ${processingStep >= 3 ? 'bg-brand-primary text-brand-surface' : 'bg-brand-bg border border-brand-border text-brand-text-secondary'}`}>3</div>
              <span className={`text-[9px] sm:text-[10px] font-space-mono uppercase tracking-wider ${processingStep >= 3 ? 'text-brand-text-primary font-bold' : 'text-brand-text-secondary'}`}>Preparation</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Workflows List */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">

        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-brand-border pb-2 shrink-0">
          <h3 className="text-[12px] font-space-mono font-bold uppercase tracking-widest text-brand-text-secondary m-0">
            Active Workflows
          </h3>
          <span className="text-[10px] text-brand-text-secondary font-space-mono bg-brand-surface border border-brand-border px-2 py-1 rounded-xs tracking-wider uppercase">
            Nodes Synchronized
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-brand-surface border border-dashed border-brand-border p-6 sm:p-10 text-center rounded-[3px] flex-1 flex flex-col justify-center items-center">
            <div className="text-[24px] font-fraunces text-brand-text-secondary/50 mb-2">System Idle</div>
            <p className="text-[14px] font-public-sans text-brand-text-secondary m-0">Submit a query above to initiate automated task generation.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-visible lg:overflow-y-auto space-y-5 lg:pr-2 scrollbar-thin">
            {tasks.map((task) => {
              // 1. Explicitly catch our new AMBIGUOUS status first
              if (task.intent_type === 'AMBIGUOUS') {
                return (
                  <AmbiguousChoiceCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                  />
                );
              }
              // 2. Route Legacy Threats or explicit Multi-Channel mitigations
              else if (task.intent_type === 'THREAT' || task.isShadowChronos) {
                return (
                  <ShadowChronosCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                  />
                );
              }
              // 3. Route standard Calendar events
              else if (task.intent_type === 'CALENDAR') {
                return (
                  <CalendarCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                    taskScopeWarnings={taskScopeWarnings}
                  />
                );
              }
              // 4. Default to Email Proxy (Handles EMAIL and MEMORY tasks)
              else {
                return (
                  <EmailProxyCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                    taskScopeWarnings={taskScopeWarnings}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
