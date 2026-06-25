import type { User } from "firebase/auth";
import { LogOut, Shield } from "lucide-react";

interface AppHeaderProps {
  user: User | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AppHeader({
  user,
  isLoading: loadingAuth,
  onLogin: handleGoogleLogin,
  onLogout: handleLogout,
}: AppHeaderProps) {
  return (
      <header className="h-14 border-b border-brand-border z-40 bg-brand-bg flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary text-brand-bg p-2 leading-none font-bold select-none text-[13px] border border-brand-primary rounded-[1px]">
            Ø0
          </div>
          <div>
            <h1 className="text-base font-bold font-fraunces tracking-tight leading-none flex items-center gap-2">
              Agent Zero 
              <span className="text-[10px] font-space-mono text-brand-surface bg-brand-primary px-1.5 py-0.5 rounded-[1.5px] uppercase tracking-normal font-normal">
                v1.0.4-STABLE
              </span>
            </h1>
          </div>
        </div>

        {/* Efficiency index block & Auth area */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end max-md:hidden">
            <span className="text-[10px] font-space-mono text-brand-text-secondary leading-none uppercase font-semibold">EFFICIENCY INDEX</span>
            <span className="font-space-mono text-xs font-bold text-brand-primary mt-0.5">94.2%</span>
          </div>

          <div className="h-6 w-px bg-brand-border max-md:hidden" />

          {/* Auth Interface area */}
          <div className="flex items-center gap-3">
            {loadingAuth ? (
              <span className="text-[10px] font-space-mono text-brand-text-secondary animate-pulse">
                SYNCING NODE...
              </span>
            ) : user ? (
              <div className="flex items-center gap-2.5 bg-brand-surface border border-brand-border py-0.5 pl-2.5 pr-1 rounded-xs h-8">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-bold leading-none font-fraunces">
                    {user.displayName || "Operator"}
                  </span>
                  <span className="text-[8px] font-space-mono text-brand-primary font-bold leading-none mt-0.5">
                    SECURE NODE
                  </span>
                </div>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 border border-brand-border hover:border-brand-primary transition-all-custom rounded-full" 
                  />
                ) : (
                  <div className="w-6 h-6 bg-brand-primary/20 flex items-center justify-center font-bold text-[10px] rounded-full">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  title="Disconnect Node"
                  className="p-1 text-brand-text-secondary hover:text-red-700 transition-all-custom"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-space-mono text-brand-primary max-sm:hidden bg-brand-surface border border-brand-border px-1.5 py-0.5 rounded-[1.5px] uppercase font-bold">
                  GUEST VAULT
                </span>
                <button
                  onClick={handleGoogleLogin}
                  className="bg-brand-primary text-brand-surface hover:bg-brand-hover text-[11px] font-bold px-3 py-1.5 rounded-xs transition-all-custom flex items-center gap-1.5 active:scale-95 cursor-pointer border border-transparent"
                >
                  <Shield className="w-3 h-3" />
                  <span>DISPATCH SIGN-IN</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
  );
}
