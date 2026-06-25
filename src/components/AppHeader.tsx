import type { User } from "firebase/auth";
import { LogOut, Shield } from "lucide-react";

interface AppHeaderProps {
  user: User | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  // Add the new prop here
  efficiencyIndex?: number | null; 
}

export function AppHeader({
  user,
  isLoading,
  onLogin,
  onLogout,
  efficiencyIndex = null,
}: AppHeaderProps) {
  return (
      <header className="h-18 border-b border-brand-border z-40 bg-brand-bg flex items-center justify-between px-8 sticky top-0">
        
        {/* Brand & Version Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-[24px] font-normal font-['Fraunces'] text-brand-text-primary tracking-tight leading-none flex items-center gap-3 m-0">
            Agent Zero 
            {/* Version Badge */}
            <span className="text-[10px] font-['Public_Sans'] bg-[#f8ecd6] text-[#9a5b00] px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-normal">
              v1.0.4
            </span>
          </h1>
        </div>

        {/* Stats & Auth Interface Area */}
        <div className="flex items-center gap-8">
          
          {/* Efficiency Index - Now Dynamic */}
          <div className="flex flex-col items-end max-md:hidden">
            <span className="text-[12px] font-['Public_Sans'] text-brand-text-secondary leading-none uppercase tracking-wide">
              Efficiency Index
            </span>
            <span className="font-['Space_Mono'] text-[14px] font-normal text-brand-text-primary mt-1">
              {/* Only show the number if the user is logged in and the index exists */}
              {user && efficiencyIndex !== null 
                ? `${efficiencyIndex.toFixed(1)}%` 
                : "--%"}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-brand-border max-md:hidden" />

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-[14px] font-['Public_Sans'] text-brand-text-secondary animate-pulse">
                Authenticating...
              </span>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-[14px] font-medium font-['Public_Sans'] text-brand-text-primary leading-none">
                    {user.displayName || "Operator"}
                  </span>
                  <span className="text-[12px] font-['Public_Sans'] text-brand-primary leading-none mt-1">
                    Connected
                  </span>
                </div>
                
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 border border-brand-border rounded-[3px] object-cover" 
                  />
                ) : (
                  <div className="w-9 h-9 bg-[#ece8dd] flex items-center justify-center font-medium font-['Public_Sans'] text-brand-text-primary text-[14px] rounded-[3px] border border-brand-border">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <button 
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#ece8dd] rounded-xs transition-all duration-200 ease-out flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={onLogin}
                  className="bg-brand-primary text-brand-surface hover:bg-brand-hover text-[14px] font-medium font-['Public_Sans'] px-4 py-2 rounded-xs transition-colors duration-200 ease-out flex items-center gap-2 cursor-pointer border border-transparent"
                >
                  <Shield className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
  );
}