import React from "react";
import { AlertTriangle, CheckCircle, Play, Trash2 } from "lucide-react";
import type { Task } from "../types";
import { parseEmailDraft } from "../services/email";

interface TaskCardProps {
  task: Task;
  handleDeleteTask: (id: string) => void;
  handleExecuteProxy: (task: Task) => Promise<void>;
  taskScopeWarnings?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// 1. SHADOW CHRONOS CARD -> Rebranded as "High-Priority Mitigation"
// ---------------------------------------------------------------------------
export const ShadowChronosCard: React.FC<TaskCardProps> = ({
  task,
  handleDeleteTask,
  handleExecuteProxy
}) => {
  return (
    <div
      id={`shadow-chronos-card-${task.id}`}
      className={`bg-brand-surface border border-red-200 p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative shadow-sm ${
        task.status === 'executed' ? 'opacity-90' : 'hover:border-red-300'
      }`}
    >
      {/* Watermark overlay when executed */}
      {task.status === 'executed' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-red-700/20 text-red-700/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Resolution Deployed</span>
          <span className="text-[10px] font-bold mt-1">Multi-Channel Alignment Secured</span>
        </div>
      )}

      {/* Flash Warning Banner - Softened for enterprise feel */}
      <div className="bg-red-50 border border-red-200 text-red-800 text-[11px] font-space-mono font-medium p-2.5 rounded-[2px] flex items-center justify-between">
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="uppercase tracking-wider">Schedule Conflict Detected // Automated Resolution Active</span>
        </span>
        <span className="bg-red-700 text-white px-2 py-0.5 text-[10px] rounded-[2px] animate-pulse font-bold tracking-wider uppercase">
          Urgent
        </span>
      </div>

      {/* Header details */}
      <div className="flex justify-between items-start gap-4 mt-1">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-space-mono uppercase font-medium bg-red-100 text-red-800 px-2 py-1 rounded-[2px] tracking-wider">
              High-Priority Mitigation
            </span>
            <span className="text-[10px] font-space-mono uppercase font-medium bg-[#f8ecd6] text-[#9a5b00] px-2 py-1 rounded-[2px] tracking-wider">
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
            className="text-brand-text-secondary hover:text-red-700 p-1 rounded-[2px] transition-all-custom cursor-pointer"
            title="Remove Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Consequences Block -> Rebranded as "Projected Impact" */}
      <div className="p-3 bg-brand-bg border border-brand-border rounded-[2px] text-[14px]">
        <p className="text-brand-text-secondary leading-relaxed font-public-sans">
          <span className="font-space-mono text-[11px] font-bold uppercase text-brand-text-primary mr-2 tracking-wider">Projected Impact:</span>
          {task.consequences}
        </p>
      </div>

      {/* Multi-tiered Remediation Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

        {/* Sub-Task 1: Gmail Notification */}
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
              <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-[2px] text-brand-text-primary flex-1">
                <div><strong className="text-brand-text-secondary font-medium">To:</strong> {to}</div>
                <div><strong className="text-brand-text-secondary font-medium">Subject:</strong> {subject}</div>
                <div className="border-t border-brand-border pt-2 mt-2 font-space-mono">
                  <span className="whitespace-pre-wrap break-words leading-relaxed text-[12px] text-brand-text-primary block max-h-24 overflow-y-auto">{body}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sub-Task 2: Calendar Booking */}
        <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-brand-border pb-2">
            <span className="text-[10px] font-space-mono tracking-wider text-brand-text-secondary uppercase font-bold">
              Phase 2: Schedule Adjustment
            </span>
            <span className="text-[10px] font-space-mono text-brand-text-primary font-bold tracking-wider">
              {task.status === 'executed' ? '✓ REGISTERED' : 'PENDING APPROVAL'}
            </span>
          </div>
          {task.calendarEvent && (
            <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-[2px] text-brand-text-primary flex-1">
              <div><strong className="text-brand-text-secondary font-medium">Event:</strong> {task.calendarEvent.title}</div>
              <div><strong className="text-brand-text-secondary font-medium">Date:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleDateString() : 'N/A'}</div>
              <div><strong className="text-brand-text-secondary font-medium">Time:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {task.calendarEvent.endTime ? new Date(task.calendarEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
              <div className="border-t border-brand-border pt-2 mt-2">
                <span className="whitespace-pre-wrap leading-relaxed text-[12px] text-brand-text-primary block max-h-16 overflow-y-auto">{task.calendarEvent.description}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Execution Trigger block */}
      <div className="mt-2">
        {task.status !== 'executed' ? (
          <button
            onClick={async () => handleExecuteProxy(task)}
            className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-3 px-4 rounded-[2px] transition-all-custom flex items-center justify-center gap-2 font-public-sans cursor-pointer shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-brand-surface" />
            <span>Confirm Automated Resolution</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2.5 flex items-center justify-center gap-2 text-brand-primary font-space-mono text-[12px] font-medium rounded-[2px] uppercase">
              <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="tracking-wider">Resolution Deployed // Multi-Channel Synchronized</span>
            </div>

            {task.prepDocUrl && (
              <a
                href={task.prepDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand-bg text-brand-primary hover:bg-brand-surface border border-brand-border hover:border-brand-primary text-[12px] font-medium py-2.5 px-4 rounded-[2px] transition-all-custom flex items-center justify-center gap-2 font-space-mono uppercase"
              >
                <Play className="w-4 h-4" />
                Access Preparation Brief
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
};


// ---------------------------------------------------------------------------
// 2. CALENDAR CARD
// ---------------------------------------------------------------------------
export const CalendarCard: React.FC<TaskCardProps> = ({
  task,
  handleDeleteTask,
  handleExecuteProxy,
  taskScopeWarnings = {}
}) => {
  return (
    <div
      id={`calendar-card-${task.id}`}
      className={`bg-brand-surface border border-brand-border p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative ${
        task.status === 'executed' ? 'opacity-85' : 'hover:border-brand-text-secondary'
      }`}
    >
      {/* CALENDAR SYNCED watermark overlay */}
      {task.status === 'executed' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-brand-primary/20 text-brand-primary/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Calendar Synchronized</span>
        </div>
      )}

      {/* Header of Task Card */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-space-mono uppercase font-medium bg-[#f8ecd6] text-[#9a5b00] px-2 py-1 rounded-[2px] tracking-wider">
              {task.stakes}
            </span>
            <span className="text-[10px] font-space-mono uppercase font-medium bg-brand-bg text-brand-text-secondary px-2 py-1 rounded-[2px] border border-brand-border tracking-wider">
              Calendar Automation
            </span>
          </div>
        </div>

        <div className="text-right flex items-start gap-6 shrink-0">
          <div>
            <div className="font-space-mono text-[10px] text-brand-text-secondary uppercase tracking-wider whitespace-nowrap">Urgency Index</div>
            <div className="font-space-mono text-[16px] font-bold text-brand-primary leading-none mt-1">{task.urgency.toFixed(1)}/10</div>
          </div>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-brand-text-secondary hover:text-red-700 p-1 rounded-[2px] transition-all-custom cursor-pointer"
            title="Remove Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Consequences Block */}
      <div className="p-3 bg-brand-bg border border-brand-border rounded-[2px] text-[14px]">
        <p className="text-brand-text-secondary leading-relaxed font-public-sans">
          <span className="font-space-mono text-[11px] font-bold uppercase text-brand-text-primary mr-2 tracking-wider">Projected Impact:</span>
          {task.consequences}
        </p>
      </div>

      {/* OAuth Section Scope Warnings */}
      {taskScopeWarnings[task.id] && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-public-sans font-medium p-3 rounded-[2px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{taskScopeWarnings[task.id]}</span>
        </div>
      )}

      {/* Solutions & Mock executing action frame */}
      {task.calendarEvent && (
        <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-brand-border pb-2">
            <span className="text-[10px] font-space-mono tracking-wider text-brand-text-secondary uppercase font-bold">
              Event Details
            </span>
            <span className="text-[10px] font-space-mono text-brand-text-primary font-bold tracking-wider">
              {task.status === 'executed' ? '✓ SYNCHRONIZED' : 'AWAITING APPROVAL'}
            </span>
          </div>

          <div className="text-[12px] font-space-mono space-y-2 bg-brand-surface p-3 border border-brand-border rounded-[2px] text-brand-text-primary">
            <div><strong className="text-brand-text-secondary font-medium">Title:</strong> {task.calendarEvent.title}</div>
            <div><strong className="text-brand-text-secondary font-medium">Date:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleDateString() : 'N/A'}</div>
            <div><strong className="text-brand-text-secondary font-medium">Time:</strong> {task.calendarEvent.startTime ? new Date(task.calendarEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {task.calendarEvent.endTime ? new Date(task.calendarEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
            <div className="border-t border-brand-border pt-2 mt-2">
              <span className="whitespace-pre-wrap leading-relaxed text-[12px] text-brand-text-primary block max-h-16 overflow-y-auto">{task.calendarEvent.description}</span>
            </div>
          </div>

          {task.status !== 'executed' ? (
            <button
              onClick={async () => handleExecuteProxy(task)}
              className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-2.5 px-4 rounded-[2px] transition-all-custom flex items-center justify-center gap-2 font-public-sans cursor-pointer mt-1"
            >
              <Play className="w-4 h-4 fill-brand-surface" />
              <span>Synchronize Event</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-1">

              {task.isCalendarSynced ? (
                <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wider">Verified: Synced to Google Calendar</span>
                </div>
              ) : task.isNativeGmailApi ? (
                <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wider">Verified: Dispatched via Google API</span>
                </div>
              ) : task.isWorkspaceSynced ? (
                <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wider">Verified: Dispatched via Workspace API</span>
                </div>
              ) : task.isAgentMatrixGateway ? (
                <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wider">Verified: Dispatched via Core Gateway</span>
                </div>
              ) : (
                <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wider">Verified: Local Timeline Populated</span>
                </div>
              )}

              {task.prepDocUrl && (
                <a
                  href={task.prepDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-bg text-brand-primary hover:bg-brand-surface border border-brand-border hover:border-brand-primary text-[12px] font-medium py-2.5 px-4 rounded-[2px] transition-all-custom flex items-center justify-center gap-2 font-space-mono uppercase"
                >
                  <Play className="w-4 h-4" />
                  Access Preparation Brief
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ---------------------------------------------------------------------------
// 3. EMAIL PROXY CARD
// ---------------------------------------------------------------------------
export const EmailProxyCard: React.FC<TaskCardProps> = ({
  task,
  handleDeleteTask,
  handleExecuteProxy,
  taskScopeWarnings = {}
}) => {
  return (
    <div
      id={`email-proxy-card-${task.id}`}
      className={`bg-brand-surface border border-brand-border p-5 rounded-[3px] flex flex-col gap-4 transition-all-custom relative ${
        task.status === 'executed' ? 'opacity-85' : 'hover:border-brand-text-secondary'
      }`}
    >
      {/* Status Watermarks */}
      {task.status === 'executed' && task.isSmtpSimulated && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-brand-primary/20 text-brand-primary/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>SMTP Dispatched</span>
        </div>
      )}

      {task.status === 'executed' && task.isAgentMatrixGateway && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-brand-primary/20 text-brand-primary/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Gateway Dispatched</span>
        </div>
      )}

      {task.status === 'executed' && task.isWorkspaceSynced && !task.isNativeGmailApi && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-brand-primary/20 text-brand-primary/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Workspace Dispatched</span>
        </div>
      )}

      {task.status === 'executed' && task.isNativeGmailApi && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none border-2 border-brand-primary/20 text-brand-primary/20 text-[14px] font-space-mono font-black tracking-widest uppercase px-4 py-2 rounded-[3px] rotate-[-5deg] z-10 flex flex-col items-center">
          <span>Native API Dispatched</span>
        </div>
      )}

      {/* Header of Task Card */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="text-[18px] font-semibold font-fraunces leading-tight text-brand-text-primary">
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-space-mono uppercase font-medium bg-[#f8ecd6] text-[#9a5b00] px-2 py-1 rounded-[2px] tracking-wider">
              {task.stakes}
            </span>
          </div>
        </div>

        <div className="text-right flex items-start gap-6 shrink-0">
          <div>
            <div className="font-space-mono text-[10px] text-brand-text-secondary uppercase tracking-wider whitespace-nowrap">Urgency Index</div>
            <div className="font-space-mono text-[16px] font-bold text-brand-primary leading-none mt-1">{task.urgency.toFixed(1)}/10</div>
          </div>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-brand-text-secondary hover:text-red-700 p-1 rounded-[2px] transition-all-custom cursor-pointer"
            title="Remove Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Consequences Block */}
      <div className="p-3 bg-brand-bg border border-brand-border rounded-[2px] text-[14px]">
        <p className="text-brand-text-secondary leading-relaxed font-public-sans">
          <span className="font-space-mono text-[11px] font-bold uppercase text-brand-text-primary mr-2 tracking-wider">Projected Impact:</span>
          {task.consequences}
        </p>
      </div>

      {/* OAuth Section Scope Warnings */}
      {taskScopeWarnings[task.id] && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-public-sans font-medium p-3 rounded-[2px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{taskScopeWarnings[task.id]}</span>
        </div>
      )}

      {/* Solutions & Mock executing action frame */}
      {task.draft && (
        <div className="border border-brand-border bg-brand-bg p-4 rounded-[3px] flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-brand-border pb-2">
            <span className="text-[10px] font-space-mono tracking-wider text-brand-text-secondary uppercase font-bold">
              Communication Draft
            </span>
            <span className="text-[10px] font-space-mono text-brand-text-primary font-bold tracking-wider">
              {task.status === 'executed' ? '✓ DISPATCHED' : 'PENDING APPROVAL'}
            </span>
          </div>

          {/* Structured TO, SUBJECT and BODY fields */}
          {(() => {
            const { to, subject, body } = parseEmailDraft(task.draft);
            return (
              <div className="text-[12px] font-space-mono space-y-1.5 bg-brand-surface p-3 border border-brand-border rounded-[2px] text-brand-text-primary">
                <div><strong className="text-brand-text-secondary font-medium">To:</strong> {to}</div>
                <div><strong className="text-brand-text-secondary font-medium">Subject:</strong> {subject}</div>
                <div className="border-t border-brand-border pt-2 mt-2 font-space-mono">
                  <span className="whitespace-pre-wrap break-words leading-relaxed text-[12px] text-brand-text-primary block max-h-32 overflow-y-auto">{body}</span>
                </div>
              </div>
            );
          })()}

          {task.status !== 'executed' ? (
            <button
              onClick={async () => handleExecuteProxy(task)}
              className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium py-2.5 px-4 rounded-[2px] transition-all-custom flex items-center justify-center gap-2 font-public-sans cursor-pointer mt-1"
            >
              <Play className="w-4 h-4 fill-brand-surface" />
              <span>Dispatch Communication</span>
            </button>
          ) : task.isNativeGmailApi ? (
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 mt-1 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="tracking-wider">Verified: Dispatched via Native API</span>
            </div>
          ) : task.isWorkspaceSynced ? (
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 mt-1 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="tracking-wider">Verified: Dispatched via Workspace API</span>
            </div>
          ) : task.isAgentMatrixGateway ? (
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 mt-1 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="tracking-wider">Verified: Dispatched via Core Gateway</span>
            </div>
          ) : (
            <div className="bg-brand-surface border border-brand-primary/30 px-3 py-2 mt-1 flex items-center gap-2 text-brand-primary font-space-mono text-[11px] font-medium rounded-[2px] uppercase">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="tracking-wider">Verified: Local Logging Complete</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};