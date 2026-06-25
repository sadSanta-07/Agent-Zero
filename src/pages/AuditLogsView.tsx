import type { Dispatch, SetStateAction } from "react";
import { Terminal } from "lucide-react";
import type { SystemLog } from "../types";

export type LogFilter = "all" | "Triage" | "Calibrator" | "Proxy" | "System";

interface AuditLogsViewProps {
  logs: SystemLog[];
  filter: LogFilter;
  onFilterChange: Dispatch<SetStateAction<LogFilter>>;
}

export function AuditLogsView({
  logs: filteredLogs,
  filter: logFilter,
  onFilterChange: setLogFilter,
}: AuditLogsViewProps) {
  return (
    <div className="bg-brand-surface border border-brand-border p-6 rounded-[3px] flex flex-col gap-5 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-brand-border pb-3">
        <Terminal className="w-5 h-5 text-brand-primary" />
        <h2 className="text-[20px] font-medium font-fraunces text-brand-text-primary m-0">System Audit Ledger</h2>
      </div>
      
      {/* Description */}
      <p className="text-[14px] font-public-sans text-brand-text-secondary leading-relaxed m-0">
        Comprehensive execution traces and routing decisions. Select a subsystem below to filter the ledger.
      </p>

      {/* Filter Badges */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Triage', 'Calibrator', 'Proxy', 'System'].map((type) => (
          <button
            key={type}
            onClick={() => setLogFilter(type as any)}
            className={`text-[11px] font-space-mono px-3 py-1.5 border transition-all-custom rounded-xs cursor-pointer uppercase tracking-wider ${
              logFilter === type 
              ? 'bg-brand-primary text-brand-surface border-brand-primary font-bold shadow-sm' 
              : 'bg-brand-bg text-brand-text-secondary border-brand-border hover:border-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            {type === 'all' ? 'All Systems' : type}
          </button>
        ))}
      </div>

      {/* Light Theme Ledger Window */}
      <div className="bg-brand-bg border border-brand-border text-brand-text-primary font-space-mono text-[12px] p-4 rounded-[3px] h-87.5 overflow-y-auto flex flex-col gap-2 scrollbar-thin shadow-inner">
        {filteredLogs.map((log) => {
          // Check for critical system events (using both old and new terminology to be safe)
          const isCritical = log.message.includes("SHADOW CHRONOS") || log.message.includes("Resolution Deployed");

          return (
            <div key={log.id} className="flex gap-3 items-start leading-relaxed text-left border-b border-brand-border/40 pb-2 last:border-0 last:pb-0">
              
              {/* Timestamp */}
              <span className="text-brand-text-secondary/70 font-medium select-none shrink-0 mt-0.5">
                [{log.timestamp}]
              </span>
              
              {/* Agent Badge - Colored based on your brand palette */}
              <span className={`font-bold select-none whitespace-nowrap px-1.5 py-0.5 rounded-xs uppercase text-[10px] tracking-wider mt-0.5 shrink-0 ${
                isCritical ? 'text-red-700 bg-red-100 border border-red-200' :
                log.agentName === 'Triage Agent' ? 'text-[#9a5b00] bg-[#f8ecd6] border border-[#f8ecd6]' : // accent-badge
                log.agentName === 'Calibrator Agent' ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20' :
                log.agentName === 'Proxy Agent' ? 'text-brand-text-primary bg-brand-surface border border-brand-border' :
                'text-brand-text-secondary bg-brand-surface border border-brand-border'
              }`}>
                {isCritical ? "System" : log.agentName.split(' ')[0]}
              </span>
              
              {/* Log Message */}
              <span className={`flex-1 wrap-break-word select-all font-medium ${isCritical ? "text-red-700" : "text-brand-text-primary"}`}>
                {log.message}
              </span>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}