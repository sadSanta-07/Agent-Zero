import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Play, Trash2, Mail, Calendar } from "lucide-react";
import type { Task } from "../types";
import { parseEmailDraft } from "../services/email";

interface TaskCardProps {
  task: Task & { prepDocUrl?: string };
  handleDeleteTask: (id: string) => void;
  handleExecuteProxy: (task: Task) => Promise<void>;
  taskScopeWarnings?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// 1. SHADOW CHRONOS CARD
// ---------------------------------------------------------------------------
export const ShadowChronosCard: React.FC<TaskCardProps> = ({
  task,
  handleDeleteTask,
  handleExecuteProxy
}) => {
  return (
    <div
      id={`shadow-chronos-card-${task.id}`}
      className={`bg-brand-surface border border-red-200 p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative shadow-sm ${task.status === 'executed' ? 'opacity-90' : 'hover:border-red-300'
        }`}
    >
      {task.status === 'executed' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-red-700/20 text-red-700/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Resolution Deployed</span>
          <span className="text-[10px] font-bold mt-1">Multi-Channel Alignment Secured</span>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] font-space-mono font-medium p-2.5 rounded-xs flex items-center justify-between">
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="uppercase tracking-wider">Schedule Conflict Detected // Automated Resolution Active</span>
        </span>
        <span className="bg-red-700 text-white px-2 py-0.5 text-[10px] rounded-xs animate-pulse font-bold tracking-wider uppercase">
          Urgent
        </span>
      </div>

      <div className="flex justify-between items-start gap-4 mt-1">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-space-mono uppercase font-medium bg-red-100 text-red-800 px-2 py-1 rounded-xs tracking-wider">
              High-Priority Mitigation
            </span>
            <span className="text-[10px] font-space-mono uppercase font-medium bg-[#f8ecd6] text-[#9a5b00] px-2 py-1 rounded-xs tracking-wider">
              {task.stakes}
            </span>
          </div>
        </div>
        <div className="text-right flex items-start gap-6 shrink-0">
          <div>
            <div className="font-space-mono text-[10px] text-brand-text-secondary uppercase tracking-wider whitespace-nowrap">Urgency Index</div>
            <div className="font-space-mono text-[16px] font-bold text-red-700 leading-none mt-1">{(task.urgency || 9.5).toFixed(1)}/10</div>
          </div>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-brand-text-secondary hover:text-red-700 p-1 rounded-xs transition-all-custom cursor-pointer"
            title="Remove Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-brand-bg border border-brand-border rounded-xs text-[14px]">
        <p className="text-brand-text-secondary leading-relaxed font-public-sans">
          <span className="font-space-mono text-[11px] font-bold uppercase text-brand-text-primary mr-2 tracking-wider">Projected Impact:</span>
          {task.consequences}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {task.draft && (
          <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <span className="text-[10px] font-space-mono tracking-wider text-brand-text-secondary uppercase font-bold">
                Phase 1: Status Communication
              </span>
              <span className="text-[10px] font-space-mono text-brand-text-primary font-bold tracking-wider">
                {task.status === 'executed' ? '✓ SENT' : 'DRAFTED'}
              </span>
            </div>
            {(() => {
              const { to, subject, body } = parseEmailDraft(task.draft);
              return (
                <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-xs text-brand-text-primary flex-1">
                  <div><strong className="text-brand-text-secondary font-medium">To:</strong> {to}</div>
                  <div><strong className="text-brand-text-secondary font-medium">Subject:</strong> {subject}</div>
                  <div className="border-t border-brand-border pt-2 mt-2 font-space-mono">
                    <span className="whitespace-pre-wrap wrap-break-word leading-relaxed text-[12px] text-brand-text-primary block max-h-24 overflow-y-auto">{body}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {task.calendarEvent && (
          <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <span className="text-[10px] font-space-mono tracking-wider text-brand-text-secondary uppercase font-bold">
                Phase 2: Schedule Adjustment
              </span>
              <span className="text-[10px] font-space-mono text-brand-text-primary font-bold tracking-wider">
                {task.status === 'executed' ? '✓ REGISTERED' : 'PENDING APPROVAL'}
              </span>
            </div>
            <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-xs text-brand-text-primary flex-1">
              <div><strong className="text-brand-text-secondary font-medium">Event:</strong> {task.calendarEvent.title}</div>
              <div><strong className="text-brand-text-secondary font-medium">Date:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleDateString() : 'N/A'}</div>
              <div><strong className="text-brand-text-secondary font-medium">Time:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {task.calendarEvent.endTime ? new Date(task.calendarEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
              <div className="border-t border-brand-border pt-2 mt-2">
                <span className="whitespace-pre-wrap leading-relaxed text-[12px] text-brand-text-primary block max-h-16 overflow-y-auto">{task.calendarEvent.description}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2">
        {task.status !== 'executed' ? (
          <button
            onClick={async () => handleExecuteProxy(task)}
            className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-3 px-4 rounded-xs transition-all-custom flex items-center justify-center gap-2 font-public-sans cursor-pointer shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-brand-surface" />
            <span>Confirm Automated Resolution</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2.5 flex items-center justify-center gap-2 text-brand-primary font-space-mono text-[12px] font-medium rounded-xs uppercase">
              <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="tracking-wider">Resolution Deployed // Multi-Channel Synchronized</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. CALENDAR CARD
// ---------------------------------------------------------------------------
export const CalendarCard: React.FC<TaskCardProps> = ({ task, handleDeleteTask, handleExecuteProxy, taskScopeWarnings = {} }) => {
  return (
    <div className={`bg-brand-surface border border-brand-border p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative ${task.status === 'executed' ? 'opacity-85' : 'hover:border-brand-text-secondary'}`}>
      {/* ... (Existing Calendar Code remains exactly the same) ... */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">{task.title}</h4>
        </div>
        <button onClick={() => handleDeleteTask(task.id)} className="text-brand-text-secondary hover:text-red-700 p-1"
          title="Remove Task"
          aria-label="Remove Task"><Trash2 className="w-4 h-4" /></button>
      </div>
      {task.calendarEvent && (
        <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
          <div className="text-[12px] font-space-mono space-y-2 bg-brand-surface p-3 border border-brand-border rounded-xs text-brand-text-primary">
            <div><strong className="text-brand-text-secondary font-medium">Title:</strong> {task.calendarEvent.title}</div>
          </div>
          {task.status !== 'executed' && (
            <button onClick={async () => handleExecuteProxy(task)} className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-2.5 px-4 rounded-xs flex items-center justify-center gap-2 cursor-pointer mt-1">
              <Play className="w-4 h-4 fill-brand-surface" />
              <span>Synchronize Event</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. EMAIL PROXY CARD
// ---------------------------------------------------------------------------
export const EmailProxyCard: React.FC<TaskCardProps> = ({ task, handleDeleteTask, handleExecuteProxy, taskScopeWarnings = {} }) => {
  return (
    <div className={`bg-brand-surface border border-brand-border p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative ${task.status === 'executed' ? 'opacity-85' : 'hover:border-brand-text-secondary'}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">{task.title}</h4>
        </div>
        <button onClick={() => handleDeleteTask(task.id)} className="text-brand-text-secondary hover:text-red-700 p-1"
          title="Remove Task"
          aria-label="Remove Task"><Trash2 className="w-4 h-4" /></button>
      </div>
      {task.draft && (
        <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
          {(() => {
            const { to, subject, body } = parseEmailDraft(task.draft);
            return (
              <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-xs text-brand-text-primary">
                <div><strong className="text-brand-text-secondary font-medium">To:</strong> {to}</div>
                <div><strong className="text-brand-text-secondary font-medium">Subject:</strong> {subject}</div>
                <div className="border-t border-brand-border pt-2 mt-2 font-space-mono">
                  <span className="whitespace-pre-wrap wrap-break-word leading-relaxed text-[12px] text-brand-text-primary block max-h-32 overflow-y-auto">{body}</span>
                </div>
              </div>
            );
          })()}
          {task.status !== 'executed' && (
            <button onClick={async () => handleExecuteProxy(task)} className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-2.5 px-4 rounded-xs flex items-center justify-center gap-2 cursor-pointer mt-1">
              <Play className="w-4 h-4 fill-brand-surface" />
              <span>Dispatch Communication</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};


// ---------------------------------------------------------------------------
// 4. AMBIGUOUS CHOICE CARD (NEW!)
// ---------------------------------------------------------------------------
export const AmbiguousChoiceCard: React.FC<TaskCardProps> = ({
  task,
  handleDeleteTask,
  handleExecuteProxy
}) => {
  const [selectedRoute, setSelectedRoute] = useState<'email' | 'calendar' | null>(null);

  const handleExecute = async () => {
    if (!selectedRoute) return;

    // Mutate the task before sending it to the proxy based on user choice
    if (selectedRoute === 'email') {
      await handleExecuteProxy({ ...task, intent_type: 'EMAIL', calendarEvent: undefined });
    } else if (selectedRoute === 'calendar') {
      await handleExecuteProxy({ ...task, intent_type: 'CALENDAR', draft: "" });
    }
  };

  return (
    <div id={`ambiguous-card-${task.id}`} className="bg-brand-surface border border-yellow-400 p-5 rounded-[3px] flex flex-col gap-4 shadow-sm">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[11px] font-space-mono font-medium p-2.5 rounded-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-600" />
        <span className="uppercase tracking-wider">Manual Disambiguation Required // Select Execution Route</span>
      </div>

      <div className="flex justify-between items-start gap-4 mt-1">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">{task.title}</h4>
        </div>
        <button onClick={() => handleDeleteTask(task.id)} className="text-brand-text-secondary hover:text-red-700 p-1"
          title="Remove Task"
          aria-label="Remove Task"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="p-3 bg-brand-bg border border-brand-border rounded-xs text-[14px]">
        <p className="text-brand-text-secondary leading-relaxed font-public-sans">
          <span className="font-space-mono text-[11px] font-bold uppercase text-brand-text-primary mr-2 tracking-wider">Projected Impact:</span>
          {task.consequences}
        </p>
      </div>

      {task.status !== 'executed' ? (
        <div className="flex flex-col gap-3 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Email Choice */}
            <button
              onClick={() => setSelectedRoute('email')}
              className={`p-4 border rounded-[3px] text-left transition-all ${selectedRoute === 'email' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border bg-brand-bg hover:border-brand-text-secondary'}`}
            >
              <div className="flex items-center gap-2 mb-2 text-brand-text-primary">
                <Mail className="w-4 h-4" />
                <span className="font-space-mono text-[12px] font-bold uppercase tracking-wider">Draft Email</span>
              </div>
              <div className="text-[11px] font-public-sans text-brand-text-secondary">Proceed with sending a communication update.</div>
            </button>

            {/* Calendar Choice */}
            <button
              onClick={() => setSelectedRoute('calendar')}
              className={`p-4 border rounded-[3px] text-left transition-all ${selectedRoute === 'calendar' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border bg-brand-bg hover:border-brand-text-secondary'}`}
            >
              <div className="flex items-center gap-2 mb-2 text-brand-text-primary">
                <Calendar className="w-4 h-4" />
                <span className="font-space-mono text-[12px] font-bold uppercase tracking-wider">Block Calendar</span>
              </div>
              <div className="text-[11px] font-public-sans text-brand-text-secondary">Proceed with scheduling an event block.</div>
            </button>
          </div>

          <button
            onClick={handleExecute}
            disabled={!selectedRoute}
            className={`w-full py-3 px-4 rounded-xs transition-all-custom flex items-center justify-center gap-2 font-public-sans shadow-sm ${selectedRoute ? 'bg-brand-primary text-brand-surface hover:bg-brand-hover cursor-pointer' : 'bg-brand-border text-brand-text-secondary cursor-not-allowed'}`}
          >
            <Play className={`w-4 h-4 ${selectedRoute ? 'fill-brand-surface' : ''}`} />
            <span>Execute Selected Route</span>
          </button>
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2.5 flex items-center justify-center gap-2 text-brand-primary font-space-mono text-[12px] font-medium rounded-xs uppercase">
          <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="tracking-wider">Disambiguation Complete // Executed</span>
        </div>
      )}
    </div>
  );
};