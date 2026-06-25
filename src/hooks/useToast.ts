import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Enterprise-grade toast notification hook.
 * Manages the lifecycle and visibility of a temporary UI toast message,
 * ensuring race conditions are handled if multiple toasts are dispatched rapidly.
 * * @param duration - Time in milliseconds before the toast auto-dismisses (default: 4000ms)
 */
export function useToast(duration = 4000) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((newMessage: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage(newMessage);

    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, duration);
  }, [duration]);
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toastMessage: message, showToast };
}