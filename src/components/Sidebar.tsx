import type { User } from "firebase/auth";
import { BrainCircuit, Cpu, Layers, Terminal } from "lucide-react";

export type AppTab = "dashboard" | "matrix" | "logs";

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenIntegrations: () => void;
  user: User | null;
}

export function Sidebar({
  activeTab,
  onTabChange: setActiveTab,
  onOpenIntegrations,
  user,
}: SidebarProps) {
  return (
    <aside className="w-60 border-r border-brand-border p-6 flex flex-col justify-between shrink-0 h-full bg-brand-bg">
      <div className="flex flex-col gap-6">
        
        {/* Navigation Directory */}
        <div>
          <span className="text-[11px] uppercase tracking-widest font-space-mono text-brand-text-secondary block mb-4">
            Directories
          </span>
          <div className="flex flex-col gap-1.5">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-all-custom rounded-[3px] text-[14px] font-public-sans ${
                activeTab === 'dashboard' 
                ? 'bg-brand-surface text-brand-text-primary font-medium' 
                : 'text-brand-text-secondary hover:bg-brand-surface/60 hover:text-brand-text-primary'
              }`}
            >
              <Layers className={`w-4 h-4 transition-colors ${activeTab === 'dashboard' ? 'text-brand-primary' : 'text-brand-text-secondary'}`} />
              <span>Triage Zone</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-all-custom rounded-[3px] text-[14px] font-public-sans ${
                activeTab === 'matrix' 
                ? 'bg-brand-surface text-brand-text-primary font-medium' 
                : 'text-brand-text-secondary hover:bg-brand-surface/60 hover:text-brand-text-primary'
              }`}
            >
              <BrainCircuit className={`w-4 h-4 transition-colors ${activeTab === 'matrix' ? 'text-brand-primary' : 'text-brand-text-secondary'}`} />
              <span>Memory Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-all-custom rounded-[3px] text-[14px] font-public-sans ${
                activeTab === 'logs' 
                ? 'bg-brand-surface text-brand-text-primary font-medium' 
                : 'text-brand-text-secondary hover:bg-brand-surface/60 hover:text-brand-text-primary'
              }`}
            >
              <Terminal className={`w-4 h-4 transition-colors ${activeTab === 'logs' ? 'text-brand-primary' : 'text-brand-text-secondary'}`} />
              <span>Diagnostics</span>
            </button>

          </div>
        </div>
      </div>

      {/* System Ops / Integrations */}
      <div className="flex flex-col gap-3 border-t border-brand-border pt-6 mt-auto">
        <span className="text-[11px] uppercase tracking-widest font-space-mono text-brand-text-secondary leading-none block">
          System Ops
        </span>
        {/* Styled exactly matching the "Secondary Button" specs in design.md */}
        <button
          onClick={onOpenIntegrations}
          className="w-full text-[14px] font-public-sans font-medium text-brand-text-secondary hover:text-brand-text-primary border border-brand-border bg-brand-bg hover:bg-brand-surface py-2 px-3 flex items-center gap-2.5 transition-all-custom rounded-xs cursor-pointer"
        >
          <Cpu className="w-4 h-4 text-brand-primary" />
          <span>Proxy Nodes</span>
        </button>
      </div>
    </aside>
  );
}