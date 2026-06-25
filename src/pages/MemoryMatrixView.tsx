import type { Dispatch, SetStateAction } from "react";
import { BrainCircuit, Trash2 } from "lucide-react";
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
<div className="bg-[#f4f1ea] border border-[#d8d2c4] p-5 rounded-[3px] flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#d8d2c4] pb-3">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#157f5b]" />
                  <h2 className="text-base font-bold font-fraunces text-[#14171a]">Memory Matrix Core</h2>
                </div>
                <button
                  onClick={() => {
                    setMemoryMatrix([]);
                    localStorage.removeItem("memoryMatrix");
                    addSystemLog('System', 'EMERGENCY WIPE: Purged all persistent context memory entities.', 'warning');
                    showToast("Contextual memory matrix wiped successfully.");
                  }}
                  className="bg-[#9a2b2b] text-[#fbfaf5] hover:bg-[#7a2020] text-[10px] font-bold py-1.5 px-3 rounded-[2px] font-space-mono uppercase cursor-pointer flex items-center gap-1.5 transition-all-custom border-none"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Wipe Memory</span>
                </button>
              </div>
              
              <p className="text-[11px] text-[#5a6066] leading-relaxed">
                Agent Zero maintains a persistent, cross-turn learning matrix to resolve relative vocal cues and shortcodes. 
                Any extracted entities, recurring deadlines, or name-to-email mapping variables are recorded below for automatic predictive fill.
              </p>

              {/* Grid Statistics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#fbfaf5] border border-[#d8d2c4] p-3 rounded-[2px]">
                  <div className="text-lg font-bold font-space-mono text-[#157f5b]">
                    {memoryMatrix.length}
                  </div>
                  <div className="text-[8.5px] font-space-mono text-[#5a6066] uppercase mt-0.5">Stored Mappings</div>
                </div>
                <div className="bg-[#fbfaf5] border border-[#d8d2c4] p-3 rounded-[2px]">
                  <div className="text-lg font-bold font-space-mono text-[#157f5b]">
                    {memoryMatrix.filter(m => m.type === 'Name -> Email').length}
                  </div>
                  <div className="text-[8.5px] font-space-mono text-[#5a6066] uppercase mt-0.5">Resolved Contacts</div>
                </div>
                <div className="bg-[#fbfaf5] border border-[#d8d2c4] p-3 rounded-[2px]">
                  <div className="text-lg font-bold font-space-mono text-[#9a5b00]">
                    {memoryMatrix.length > 0 ? new Date(Math.max(...memoryMatrix.map(m => new Date(m.timestamp).getTime()))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </div>
                  <div className="text-[8.5px] font-space-mono text-[#5a6066] uppercase mt-0.5">Last Synced</div>
                </div>
              </div>

              {/* Memory Data Table */}
              <div className="border border-[#d8d2c4] rounded-[2px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#d8d2c4]/40 border-b border-[#d8d2c4] text-[9px] font-space-mono font-bold text-[#5a6066] uppercase tracking-wider">
                        <th className="p-2.5">Entity Type</th>
                        <th className="p-2.5">Key / Shortcode</th>
                        <th className="p-2.5">Resolved Value</th>
                        <th className="p-2.5">Logged Timestamp</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8d2c4] font-space-mono text-[11px] text-[#14171a]">
                      {memoryMatrix.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#5a6066] italic bg-[#fbfaf5]">
                            No persistent entities registered in the memory matrix core. Use the main triage pipeline to register mappings.
                          </td>
                        </tr>
                      ) : (
                        memoryMatrix.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-[#fbfaf5]' : 'bg-[#f4f1ea]'}>
                            <td className="p-2.5">
                              <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                                item.type === 'Name -> Email' 
                                  ? 'bg-[#157f5b]/10 text-[#157f5b]' 
                                  : item.type === 'Project Name'
                                  ? 'bg-[#105f44]/10 text-[#105f44]'
                                  : 'bg-[#9a5b00]/10 text-[#9a5b00]'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-[#105f44]">{item.key}</td>
                            <td className="p-2.5 break-all select-all">{item.value}</td>
                            <td className="p-2.5 text-xs text-[#5a6066]">
                              {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => {
                                  setMemoryMatrix(prev => {
                                    const filtered = prev.filter(m => m.id !== item.id);
                                    localStorage.setItem("memoryMatrix", JSON.stringify(filtered));
                                    return filtered;
                                  });
                                  addSystemLog('System', `Deleted memory mapping: [${item.key}]`, 'info');
                                  showToast("Memory mapping deleted.");
                                }}
                                className="text-[#9a2b2b] hover:text-[#7a2020] p-1 font-bold cursor-pointer border-none bg-transparent"
                                title="Delete Entity"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick persistent helper */}
              <div className="bg-[#fbfaf5] border border-dashed border-[#157f5b]/20 p-3 rounded-[2px] flex flex-col gap-2">
                <span className="text-[10px] font-space-mono font-bold text-[#157f5b] uppercase">Manual Registration Node</span>
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
                      addSystemLog('System', `Manually registered mapping: [${newEnt.key} -> ${newEnt.value}]`, 'success');
                      showToast("Manual memory entry established.");
                      form.reset();
                    }
                  }}
                  className="flex flex-wrap gap-2 items-center text-[10px] font-space-mono"
                >
                  <select name="memType" className="bg-[#fbfaf5] border border-[#d8d2c4] text-[10px] font-space-mono p-1 rounded-[1px] focus:outline-none focus:border-[#157f5b] cursor-pointer">
                    <option value="Name -> Email">Name {"->"} Email</option>
                    <option value="Project Name">Project Name</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Entity">Entity</option>
                  </select>
                  <input 
                    name="memKey" 
                    placeholder="Shortcode / Key" 
                    className="bg-[#fbfaf5] border border-[#d8d2c4] text-[10px] font-space-mono p-1 rounded-[1px] focus:outline-none focus:border-[#157f5b] min-w-[120px] placeholder-[#5a6066]/50" 
                    required 
                  />
                  <input 
                    name="memVal" 
                    placeholder="Resolved Value" 
                    className="bg-[#fbfaf5] border border-[#d8d2c4] text-[10px] font-space-mono p-1 rounded-[1px] focus:outline-none focus:border-[#157f5b] min-w-[200px] placeholder-[#5a6066]/50" 
                    required 
                  />
                  <button 
                    type="submit" 
                    className="bg-[#157f5b] hover:bg-[#105f44] text-[#fbfaf5] text-[9px] font-bold py-1 px-3.5 rounded-[1.5px] font-space-mono uppercase cursor-pointer transition-all-custom border-none"
                  >
                    Add mapping
                  </button>
                </form>
              </div>
            </div>
  );
}

