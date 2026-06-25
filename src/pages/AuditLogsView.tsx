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
<div className="bg-[#f4f1ea] border border-[#d8d2c4] p-4 rounded-[3px] flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[#d8d2c4] pb-2">
                <Terminal className="w-4 h-4 text-[#157f5b]" />
                <h2 className="text-sm font-bold font-fraunces text-[#14171a]">Full Audit Telemetry Logs</h2>
              </div>
              <p className="text-[11px] text-[#5a6066] leading-relaxed">
                Granular trace files generated from our multi-agent kernel. Use badges below to filter trace layers.
              </p>

              <div className="flex gap-1.5 flex-wrap">
                {['all', 'Triage', 'Calibrator', 'Proxy', 'System'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setLogFilter(type as any)}
                    className={`text-[9px] font-space-mono px-2 py-0.5 border transition-all-custom rounded-[1.5px] cursor-pointer ${
                      logFilter === type 
                      ? 'bg-[#157f5b] text-[#fbfaf5] border-transparent font-bold' 
                      : 'bg-transparent text-[#5a6066] border-[#d8d2c4] hover:bg-[#fbfaf5]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 text-neutral-300 font-space-mono text-[11px] p-3 rounded-[2.5px] h-[300px] overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start leading-relaxed text-left">
                    <span className="text-neutral-500 font-light select-none">[{log.timestamp}]</span>
                    <span className={`font-bold select-none whitespace-nowrap px-1 uppercase text-[9px] ${
                      log.message.includes("SHADOW CHRONOS GATEWAY DEPLOYED") ? 'text-[#dc2626] bg-red-500/10' :
                      log.agentName === 'Triage Agent' ? 'text-amber-400 bg-amber-400/10' :
                      log.agentName === 'Calibrator Agent' ? 'text-cyan-400 bg-cyan-400/10' :
                      log.agentName === 'Proxy Agent' ? 'text-emerald-400 bg-emerald-400/10' :
                      'text-slate-400 bg-slate-400/10'
                    }`}>
                      {log.message.includes("SHADOW CHRONOS GATEWAY DEPLOYED") ? "System" : log.agentName.split(' ')[0]}
                    </span>
                    <span className={`flex-1 break-all select-all font-light ${log.message.includes("SHADOW CHRONOS GATEWAY DEPLOYED") ? "text-[#dc2626] font-bold" : ""}`}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
  );
}

