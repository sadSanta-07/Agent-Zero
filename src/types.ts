export interface CalendarEvent {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface Task {
  id: string;
  userId: string | null; // null if guest mode
  rawText: string;
  title: string;
  intent_type: 'EMAIL' | 'CALENDAR' | 'THREAT' | string;
  deadline: string | null;
  entities: string[];
  urgency: number;
  consequences: string;
  stakes: string;
  draft: string;
  status: 'triage' | 'calibrating' | 'proxy_ready' | 'executed';
  
  isCalendarEvent?: boolean;
  calendarEvent?: CalendarEvent;
  isShadowChronos?: boolean;
  prepDocUrl?: string; 
  
  isSmtpSimulated?: boolean;
  isWorkspaceSynced?: boolean;
  isAgentMatrixGateway?: boolean;
  isNativeGmailApi?: boolean;
  isCalendarSynced?: boolean;
  
  source?: "gmail" | "extension" | "manual";
  sourceMessageId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  agentName: 'System' | 'Triage Agent' | 'Calibrator Agent' | 'Proxy Agent';
  message: string;
  type: 'info' | 'warning' | 'success' | 'action' | 'error';
}

export interface MemoryEntity {
  id: string;
  type: 'Name -> Email' | 'Project Name' | 'Deadline' | 'Entity';
  key: string;
  value: string;
  timestamp: string;
}