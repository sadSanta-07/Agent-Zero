import type { Dispatch, SetStateAction } from "react";
import { Database, Trash2, Plus } from "lucide-react";
import type { MemoryEntity, SystemLog } from "../types";

interface MemoryMatrixViewProps {
  entries: MemoryEntity[];
  onEntriesChange: Dispatch<SetStateAction<MemoryEntity[]>>;
  addSystemLog: (
    agent: SystemLog["agentName"],
    message: string,
    type: SystemLog["type"],
  ) => void;
  showToast: (message: string) => void;
}

export function MemoryMatrixView({
  entries: memoryMatrix,
  onEntriesChange: setMemoryMatrix,
  addSystemLog,
  showToast,
}: MemoryMatrixViewProps) {
  return (
    <div className="bg-brand-surface border border-brand-border p-6 rounded-[3px] flex flex-col gap-6 shadow-sm min-h-0 h-full overflow-y-auto scrollbar-thin">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-brand-primary" />
          <h2 className="text-[24px] font-normal font-fraunces text-brand-text-primary m-0">Entity Resolution Matrix</h2>
        </div>
        <button
          onClick={() => {
            setMemoryMatrix([]);
            localStorage.removeItem("memoryMatrix");
            addSystemLog('System', 'Ledger Purged: All persistent context entities cleared.', 'warning');
            showToast("Entity resolution matrix cleared.");
          }}
          className="bg-brand-bg text-red-600 hover:bg-red-50 border border-brand-border hover:border-red-200 text-[13px] font-medium py-2 px-3 rounded-xs font-public-sans cursor-pointer flex items-center gap-2 transition-all-custom shadow-sm"
          title="Clear Database"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge Ledger</span>
        </button>
      </div>
      
      {/* Description */}
      <p className="text-[14px] font-public-sans text-brand-text-secondary leading-relaxed m-0 shrink-0 max-w-4xl">
        The system maintains a persistent, cross-turn entity database to resolve relative cues and shortcodes. 
        Extracted variables, recurring deadlines, and contact mappings are logged below for automated predictive insertion during task processing.
      </p>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-brand-bg border border-brand-border p-4 rounded-[3px] shadow-sm flex flex-col justify-center">
          <div className="text-[24px] font-bold font-space-mono text-brand-primary leading-none">
            {memoryMatrix.length}
          </div>
          <div className="text-[11px] font-space-mono text-brand-text-secondary uppercase tracking-wider mt-2">Stored Entities</div>
        </div>
        <div className="bg-brand-bg border border-brand-border p-4 rounded-[3px] shadow-sm flex flex-col justify-center">
          <div className="text-[24px] font-bold font-space-mono text-brand-primary leading-none">
            {memoryMatrix.filter(m => m.type === 'Name -> Email').length}
          </div>
          <div className="text-[11px] font-space-mono text-brand-text-secondary uppercase tracking-wider mt-2">Resolved Contacts</div>
        </div>
        <div className="bg-brand-bg border border-brand-border p-4 rounded-[3px] shadow-sm flex flex-col justify-center">
          <div className="text-[24px] font-bold font-space-mono text-[#9a5b00] leading-none">
            {memoryMatrix.length > 0 ? new Date(Math.max(...memoryMatrix.map(m => new Date(m.timestamp).getTime()))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
          <div className="text-[11px] font-space-mono text-brand-text-secondary uppercase tracking-wider mt-2">Last Synchronized</div>
        </div>
      </div>

      {/* Memory Data Table */}
      <div className="border border-brand-border rounded-[3px] overflow-hidden bg-brand-bg shadow-sm shrink-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-[11px] font-space-mono font-bold text-brand-text-secondary uppercase tracking-wider">
                <th className="p-3 font-semibold">Entity Type</th>
                <th className="p-3 font-semibold">Shortcode / Key</th>
                <th className="p-3 font-semibold">Resolved Value</th>
                <th className="p-3 font-semibold">Logged Timestamp</th>
                <th className="p-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border font-public-sans text-[13px] text-brand-text-primary">
              {memoryMatrix.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-brand-text-secondary italic">
                    No persistent entities registered in the matrix. Use the main triage pipeline to register automated mappings.
                  </td>
                </tr>
              ) : (
                memoryMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-surface/50 transition-colors">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-xs text-[10px] font-space-mono font-bold uppercase tracking-wider ${
                        item.type === 'Name -> Email' 
                          ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                          : item.type === 'Project Name'
                          ? 'bg-brand-surface border border-brand-border text-brand-text-secondary'
                          : 'bg-[#f8ecd6] text-[#9a5b00] border border-brand-border'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 font-space-mono font-medium text-brand-text-primary">{item.key}</td>
                    <td className="p-3 break-all select-all text-brand-text-secondary">{item.value}</td>
                    <td className="p-3 text-[12px] text-brand-text-secondary font-space-mono">
                      {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setMemoryMatrix(prev => {
                            const filtered = prev.filter(m => m.id !== item.id);
                            localStorage.setItem("memoryMatrix", JSON.stringify(filtered));
                            return filtered;
                          });
                          addSystemLog('System', `Deleted entity mapping: [${item.key}]`, 'info');
                          showToast("Entity mapping deleted.");
                        }}
                        className="text-brand-text-secondary hover:text-red-600 p-1.5 rounded-xs hover:bg-red-50 transition-all-custom cursor-pointer inline-flex items-center justify-center"
                        title="Delete Entity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Registration Node */}
      <div className="bg-brand-bg border border-brand-border p-5 rounded-[3px] flex flex-col gap-4 shadow-sm mt-auto shrink-0">
        <span className="text-[11px] font-space-mono font-bold text-brand-text-secondary uppercase tracking-wider">
          Manual Entity Registration
        </span>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const keyInput = form.elements.namedItem('memKey') as HTMLInputElement;
            const valInput = form.elements.namedItem('memVal') as HTMLInputElement;
            const typeSelect = form.elements.namedItem('memType') as HTMLSelectElement;
            
            if (keyInput.value.trim() && valInput.value.trim()) {
              const newEnt: MemoryEntity = {
                id: "mem_" + Date.now(),
                type: typeSelect.value as any,
                key: keyInput.value.trim(),
                value: valInput.value.trim(),
                timestamp: new Date().toISOString()
              };
              setMemoryMatrix(prev => {
                const updated = [...prev, newEnt];
                localStorage.setItem("memoryMatrix", JSON.stringify(updated));
                return updated;
              });
              addSystemLog('System', `Manually registered entity: [${newEnt.key} -> ${newEnt.value}]`, 'success');
              showToast("Manual entity established.");
              form.reset();
            }
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <select 
            name="memType" 
            aria-label="Entity type"
            title="Select entity type"
            className="bg-brand-surface border border-brand-border text-[13px] font-public-sans text-brand-text-primary p-2.5 rounded-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer shadow-sm"
          >
            <option value="Name -> Email">Name {"->"} Email</option>
            <option value="Project Name">Project Name</option>
            <option value="Deadline">Deadline</option>
            <option value="Entity">Entity</option>
          </select>
          
          <input 
            name="memKey" 
            placeholder="Shortcode / Key" 
            className="flex-1 min-w-37.5 bg-brand-surface border border-brand-border text-[13px] font-public-sans text-brand-text-primary p-2.5 rounded-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder-brand-text-secondary/60 shadow-inner" 
            required 
          />
          
          <input 
            name="memVal" 
            placeholder="Resolved Value (e.g., email address, specific date)" 
            className="flex-2 min-w-62.5 bg-brand-surface border border-brand-border text-[13px] font-public-sans text-brand-text-primary p-2.5 rounded-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder-brand-text-secondary/60 shadow-inner" 
            required 
          />
          
          <button 
            type="submit" 
            className="bg-brand-primary hover:bg-brand-hover text-brand-surface text-[13px] font-medium py-2.5 px-5 rounded-xs font-public-sans cursor-pointer transition-all-custom flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Entity</span>
          </button>
        </form>
      </div>
      
    </div>
  );
}