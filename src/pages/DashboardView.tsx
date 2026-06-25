import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Mic, MicOff, Plus } from "lucide-react";
import type { Task } from "../types";
import { CalendarCard, EmailProxyCard, ShadowChronosCard } from "../components/TaskCards";

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
    <div className="flex flex-col gap-5 min-h-0">
      {/* Introduction header info */}
      <div className="flex flex-col gap-1.5 fade-up">
        <h2 className="font-fraunces text-2xl text-brand-text-primary">Triage Zone</h2>
        <p className="text-xs text-brand-text-secondary leading-relaxed">
          Dump raw intentions, threats, or tasks here. Zero-Trust parser compiles structured covers, true urgency calculations, stakes indexes, and ready-to-execute proxy letters.
        </p>
      </div>

      {/* Chat-Like Thought Input Box */}
      <div className="bg-brand-surface border border-brand-border p-4 rounded-[3px] fade-up">
        <form onSubmit={handleLaunchTriage} className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-widest font-space-mono font-bold text-[#5a6066]">
              Intention Receptacle
            </label>
            <span className="text-[9px] font-space-mono text-brand-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              LIVE PARSING ACTIVE
            </span>
          </div>

          <div className="relative">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='e.g., "I still haven&apos;t draft and sent the update client email. I should do it today but keep postponing."'
              className="w-full h-20 bg-brand-bg border border-brand-border p-2.5 pr-10 text-xs focus:outline-none focus:border-[#157f5b] placeholder-[#5a6066]/50 rounded-[2px] transition-all-custom resize-none"
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-all-custom flex items-center justify-center animate-pulse cursor-pointer"
                  title="Stop Vocal Interception"
                >
                  <MicOff className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-[#14171a] hover:bg-[#fbfaf5] p-1.5 rounded-[2px] transition-all-custom flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Begin Vocal Interception"
                >
                  <Mic className="w-3.5 h-3.5 text-brand-primary" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                console.log("SCAN CLICKED");
                handleScanInbox();
              }}
              disabled={isProcessing}
              className="bg-brand-surface border border-brand-border text-brand-primary px-4 py-1.5 text-[10px] font-bold rounded-[2px]"
            >
              Scan Inbox
            </button>

            <button
              type="submit"
              disabled={isProcessing || !rawInput.trim()}
              className={`text-[10px] font-bold px-4 py-1.5 rounded-xs transition-all-custom flex items-center gap-1.5 uppercase tracking-dense cursor-pointer ${!rawInput.trim() || isProcessing
                ? 'bg-brand-border text-brand-text-secondary/70 cursor-not-allowed'
                : 'bg-brand-primary text-brand-surface/95 hover:bg-brand-hover border border-transparent'
                }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-brand-surface border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Process Thought</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Intelligent Agent Progress Stepper */}
        {isProcessing && (
          <div className="mt-3 border-t border-[#d8d2c4]/60 pt-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center text-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-space-mono font-bold ${processingStep >= 1 ? 'bg-[#157f5b] text-[#fbfaf5]' : 'bg-[#d8d2c4] text-[#5a6066]'
                }`}>1</div>
              <span className="text-[9px] mt-1 font-space-mono text-[#14171a] font-semibold">Triage Agent</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-space-mono font-bold ${processingStep >= 2 ? 'bg-[#157f5b] text-[#fbfaf5]' : 'bg-[#d8d2c4] text-[#5a6066]'
                }`}>2</div>
              <span className="text-[9px] mt-1 font-space-mono text-[#14171a] font-semibold">Calibrator</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-space-mono font-bold ${processingStep >= 3 ? 'bg-[#157f5b] text-[#fbfaf5]' : 'bg-[#d8d2c4] text-[#5a6066]'
                }`}>3</div>
              <span className="text-[9px] mt-1 font-space-mono text-[#14171a] font-semibold">Proxy Cover</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Interceptions Category List */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex justify-between items-center border-b border-[#d8d2c4] pb-1.5 shrink-0">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#5a6066]">
            Active Interceptions
          </h3>
          <span className="text-[9px] text-[#5a6066] font-space-mono bg-[#f4f1ea] border border-[#d8d2c4] px-1.5 py-0.5 rounded-[1.5px]">
            COVERS SYNCHRONIZED
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="border border-dashed border-[#d8d2c4] p-8 text-center text-[#5a6066] rounded-[3px] flex-1 flex flex-col justify-center items-center">
            <div className="text-lg font-fraunces text-[#14171a]/40 italic">System Idle</div>
            <p className="text-xs mt-1">Submit an intention above to trigger autonomous protective intercepts.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {tasks.map((task) => {
              if (task.intent_type === 'THREAT' || task.urgency >= 8.5) {
                return (
                  <ShadowChronosCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                  />
                );
              } else if (task.intent_type === 'CALENDAR') {
                return (
                  <CalendarCard
                    key={task.id}
                    task={task}
                    handleDeleteTask={handleDeleteTask}
                    handleExecuteProxy={handleExecuteProxy}
                    taskScopeWarnings={taskScopeWarnings}
                  />
                );
              } else {
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

