export interface Task {
  id: string;
  userId: string | null; // null if guest mode
  rawText: string;
  title: string;
  intent_type?: 'EMAIL' | 'CALENDAR' | 'THREAT';
  deadline: string;
  entities: string[];
  urgency: number;
  consequences: string;
  stakes: string;
  draft: string;
  status: 'triage' | 'calibrating' | 'proxy_ready' | 'executed';
  createdAt: string;
  updatedAt: string;
  isSmtpSimulated?: boolean;
  isWorkspaceSynced?: boolean;
  isAgentMatrixGateway?: boolean;
  isNativeGmailApi?: boolean;
  isCalendarSynced?: boolean;
  isCalendarEvent?: boolean;
  isShadowChronos?: boolean;
  calendarEvent?: {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    prepDocUrl?: string;
  };
}

export interface SystemLog {
  id: string;
  timestamp: string;
  agentName: 'System' | 'Triage Agent' | 'Calibrator Agent' | 'Proxy Agent';
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
}

export interface MemoryEntity {
  id: string;
  type: 'Name -> Email' | 'Project Name' | 'Deadline' | 'Entity';
  key: string;
  value: string;
  timestamp: string;
}
