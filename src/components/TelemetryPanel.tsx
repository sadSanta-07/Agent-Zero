import type { RefObject } from "react";
import { BrainCircuit, Cpu, Globe, Terminal } from "lucide-react";
import type { SystemLog } from "../types";

interface TelemetryPanelProps {
  logs: SystemLog[];
  endRef: RefObject<HTMLDivElement | null>;
}

export function TelemetryPanel({
  logs,
  endRef: logTerminalEndRef,
}: TelemetryPanelProps) {
  return (
    <aside className="w-85 border-l border-brand-border bg-brand-surface p-6 flex flex-col justify-between shrink-0 h-full overflow-hidden">
      <div className="flex flex-col h-full min-h-0 gap-4">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-brand-border pb-3 shrink-0">
          <h3 className="text-[11px] uppercase tracking-widest font-space-mono font-bold text-brand-text-secondary flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-primary animate-[spin_8s_linear_infinite]" />
            System Activity Log
          </h3>
          <span className="text-[10px] font-space-mono font-bold text-brand-primary bg-brand-primary/10 py-1 px-2 rounded-xs tracking-wider uppercase">
            System Online
          </span>
        </div>

        <p className="text-[14px] font-public-sans text-brand-text-secondary leading-relaxed shrink-0 m-0">
          Real-time execution ledger from automated proxy workflows:
        </p>

        <div className="flex-1 bg-brand-bg border border-brand-border text-brand-text-primary font-space-mono text-[12px] p-4 rounded-[3px] overflow-y-auto flex flex-col gap-3 scrollbar-thin min-h-0 shadow-sm">
          {logs.map((log) => {
            const isCritical = log.message.includes("SHADOW CHRONOS") || log.message.includes("Resolution Deployed");
            
            return (
              <div key={log.id} className="flex flex-col gap-1 leading-relaxed text-left border-b border-brand-border/60 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between font-medium text-[10px] text-brand-text-secondary">
                  <span className={`uppercase tracking-wider font-bold ${
                    isCritical ? 'text-red-700' :
                    log.agentName === 'Triage Agent' ? 'text-[#9a5b00]' : 
                    log.agentName === 'Calibrator Agent' ? 'text-brand-primary' : 
                    log.agentName === 'Proxy Agent' ? 'text-brand-text-primary' : 
                    'text-brand-text-secondary'
                  }`}>
                    {isCritical ? 'System Critical' : log.agentName}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <p className={`select-all wrap-break-word m-0 ${isCritical ? "text-red-700 font-medium" : "text-brand-text-primary"}`}>
                  {log.message}
                </p>
              </div>
            );
          })}
          <div ref={logTerminalEndRef} />
        </div>

        {/* Bottom Node Status List */}
        <div className="border-t border-brand-border pt-4 grid grid-cols-3 gap-3 shrink-0 text-center text-[10px] font-space-mono font-bold text-brand-text-secondary">
          
          <div className="bg-brand-bg border border-brand-border py-2 px-1 rounded-xs flex flex-col items-center transition-all-custom hover:border-brand-text-secondary shadow-sm">
            <Cpu className="w-4 h-4 text-[#9a5b00] mb-1.5" />
            <span className="tracking-wider text-brand-text-primary">TRIAGE</span>
            <span className="text-brand-primary text-[9px] mt-1 font-medium">ACTIVE</span>
          </div>
          
          <div className="bg-brand-bg border border-brand-border py-2 px-1 rounded-xs flex flex-col items-center transition-all-custom hover:border-brand-text-secondary shadow-sm">
            <BrainCircuit className="w-4 h-4 text-brand-primary mb-1.5" />
            <span className="tracking-wider text-brand-text-primary">CALIBRATE</span>
            <span className="text-brand-primary text-[9px] mt-1 font-medium">ACTIVE</span>
          </div>
          
          <div className="bg-brand-bg border border-brand-border py-2 px-1 rounded-xs flex flex-col items-center transition-all-custom hover:border-brand-text-secondary shadow-sm">
            <Terminal className="w-4 h-4 text-brand-text-primary mb-1.5" />
            <span className="tracking-wider text-brand-text-primary">PROXY</span>
            <span className="text-brand-primary text-[9px] mt-1 font-medium">ACTIVE</span>
          </div>

        </div>

      </div>
    </aside>
  );
}