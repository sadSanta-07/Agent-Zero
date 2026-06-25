import { useCallback, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithPopup, signOut } from "../firebase";
import type { AddSystemLog } from "./useSystemLogs";

interface UseAuthOptions {
  addSystemLog: AddSystemLog;
  showToast: (message: string) => void;
}

export function useAuth({ addSystemLog, showToast }: UseAuthOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() =>
    localStorage.getItem("google_oauth_token") || localStorage.getItem("google_access_token")
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
      
      // Enterprise-grade telemetry phrasing
      addSystemLog(
        "System",
        firebaseUser
          ? `Authentication verified for: ${firebaseUser.email}`
          : "Operating in local mode. Session data is restricted to local storage.",
        firebaseUser ? "success" : "info",
      );
    });

    return () => unsubscribe();
  }, [addSystemLog]);

  const login = useCallback(async () => {
    try {
      addSystemLog("System", "Initiating Google Workspace OAuth flow...", "action");
      
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/gmail.send");
      provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.events");
      provider.addScope("https://www.googleapis.com/auth/documents");
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        localStorage.setItem("google_access_token", credential.accessToken);
        localStorage.setItem("google_oauth_token", credential.accessToken);
        
        addSystemLog("System", "Google Workspace permissions granted and synchronized.", "success");
      }
      
      if (result.user) {
        showToast(`Authenticated successfully as ${result.user.displayName}`);
      }
    } catch (error) {
      console.error("OAuth Error:", error);
      addSystemLog("System", "OAuth flow canceled or failed to resolve.", "warning");
      showToast("Authentication failed. Please try again.");
    }
  }, [addSystemLog, showToast]);

  const logout = useCallback(async () => {
    addSystemLog("System", "Ending user session...", "action");
    
    await signOut(auth);
    setGoogleAccessToken(null);
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_oauth_token");
    
    showToast("Signed out successfully.");
  }, [addSystemLog, showToast]);

  return { user, loadingAuth, googleAccessToken, login, logout };
}