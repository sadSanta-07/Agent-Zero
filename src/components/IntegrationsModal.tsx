import { BookOpen, Database, FolderLock, Globe } from "lucide-react";

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => void;
}

export function IntegrationsModal({
  isOpen,
  onClose,
  onCommit,
}: IntegrationsModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop: Softened the dark overlay slightly to let the cream background breathe
    <div className="fixed inset-0 z-50 bg-brand-text-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Modal Container: Using surface color, 3px radius, and your custom fade-up animation */}
      <div className="bg-brand-surface border border-brand-border max-w-sm w-full p-5 text-left rounded-[3px] flex flex-col gap-5 shadow-sm animate-fade-up">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <h2 className="text-[24px] font-normal font-fraunces text-brand-text-primary flex items-center gap-2 m-0">
            <FolderLock className="w-5 h-5 text-brand-primary" />
            Proxy Nodes
          </h2>
          <button 
            onClick={onClose}
            className="font-space-mono text-[11px] text-brand-text-secondary hover:text-brand-text-primary p-1 cursor-pointer transition-all-custom uppercase tracking-wider"
          >
            [Close]
          </button>
        </div>

        {/* Description */}
        <p className="text-[14px] font-public-sans text-brand-text-secondary leading-relaxed m-0">
          Define remote hooks parameters to trigger automated task coverage securely across local or cloud interfaces.
        </p>

        {/* Integration Nodes List */}
        <div className="flex flex-col gap-3">
          
          {/* PostgreSQL Node */}
          <div className="bg-brand-bg border border-brand-border p-3 rounded-[3px] flex items-center justify-between hover:border-brand-text-secondary transition-all-custom">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-text-secondary" />
              <span className="text-[14px] font-public-sans text-brand-text-primary">PostgreSQL Hook</span>
            </div>
            {/* Reusing the Learned Badge style for PENDING to keep the design system consistent */}
            <span className="text-[10px] font-space-mono text-[#9a5b00] bg-[#f8ecd6] px-1.5 py-0.5 uppercase rounded-xs tracking-wider">
              Pending
            </span>
          </div>

          {/* Gemini API Node */}
          <div className="bg-brand-bg border border-brand-border p-3 rounded-[3px] flex items-center justify-between hover:border-brand-text-secondary transition-all-custom">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-primary" />
              <span className="text-[14px] font-public-sans text-brand-text-primary">Gemini API Core</span>
            </div>
            <span className="text-[10px] font-space-mono text-brand-surface bg-brand-primary px-1.5 py-0.5 uppercase rounded-xs tracking-wider">
              Active
            </span>
          </div>

          {/* Workspace Node */}
          <div className="bg-brand-bg border border-brand-border p-3 rounded-[3px] flex items-center justify-between hover:border-brand-text-secondary transition-all-custom">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-text-secondary" />
              <span className="text-[14px] font-public-sans text-brand-text-primary">Workspace Hook</span>
            </div>
            <span className="text-[10px] font-space-mono text-brand-text-secondary bg-brand-border/50 px-1.5 py-0.5 uppercase rounded-xs tracking-wider">
              Standby
            </span>
          </div>

        </div>

        {/* Footer Action */}
        <button
          onClick={onCommit}
          className="w-full bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium font-public-sans py-2.5 px-4 rounded-xs transition-colors duration-200 ease-out cursor-pointer mt-1 border border-transparent"
        >
          Commit Handshake
        </button>
      </div>
    </div>
  );
}