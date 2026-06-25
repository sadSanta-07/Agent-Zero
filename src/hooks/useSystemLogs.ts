import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialSystemLogs } from "../initialData";
import type { SystemLog } from "../types";
import type { LogFilter } from "../pages/AuditLogsView";

const MAX_LOG_HISTORY = 1000;

export type AddSystemLog = (
  agentName: SystemLog["agentName"],
  message: string,
  type: SystemLog["type"],
) => void;

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>(initialSystemLogs);
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  const addSystemLog = useCallback<AddSystemLog>((agentName, message, type) => {
    const now = new Date();
    
    const formattedTimestamp = `${now.toLocaleTimeString("en-US", { hour12: false })}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const newLog: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formattedTimestamp,
      agentName,
      message,
      type,
    };

    setLogs((previousLogs) => {
      const updatedLogs = [...previousLogs, newLog];
      
      if (updatedLogs.length > MAX_LOG_HISTORY) {
        return updatedLogs.slice(updatedLogs.length - MAX_LOG_HISTORY);
      }
      return updatedLogs;
    });
  }, []);

  useEffect(() => {
    logTerminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return logs;
    
    return logs.filter((log) =>
      log.agentName.toLowerCase().includes(logFilter.toLowerCase()),
    );
  }, [logFilter, logs]);

  return {
    logs,
    filteredLogs,
    logFilter,
    setLogFilter,
    logTerminalEndRef,
    addSystemLog,
  };
}