import { Sparkles } from "lucide-react";
interface ToastProps {
  message: string | null;
}
export function Toast({ message: toastMessage }: ToastProps) {
  if (!toastMessage) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-brand-text-primary text-brand-surface px-4 py-3 rounded-[3px] flex items-center gap-3 animate-fade-up max-w-sm shadow-md">
      <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
      <span className="font-public-sans text-[13px] font-medium leading-snug tracking-wide">
        {toastMessage}
      </span>
    </div>
  );
}