import type { Task, SystemLog } from "./types";

export const initialTasks: Task[] = [
  {
    id: "task-1",
    userId: null,
    rawText: "I still haven't paid the City Power electric bill. It is due tomorrow and I am worried about late fees.",
    title: "Process Utility Vendor Payment",
    intent_type: "EMAIL",
    deadline: "Tomorrow by 5:00 PM",
    entities: ["City Power Corp", "Billing Department"],
    urgency: 9.2,
    consequences: "Service interruption, compounding late fees, and potential impact on operational capabilities.",
    stakes: "Financial Penalty / SLA Risk",
    draft: "TO: billing@citypower-billing.com\nSUBJECT: Account #X-481903 - Payment Authorization Notice\n\nTo the Billing Department,\n\nPlease be advised that electronic payment authorization has been submitted for Account #X-481903 in the amount of $142.50. This fully settles the current billing cycle. Kindly update the account ledger to reflect this pending transfer.\n\nRegards,\nAutomated Accounts Payable Node",
    status: "proxy_ready",
    isCalendarEvent: false,
    isShadowChronos: true, // Flags it as a high-priority mitigation target
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "task-2",
    userId: null,
    rawText: "Need to write a client project progress report, but I have no motivation and it's due soon.",
    title: "Submit Q3 Partner Progress Brief",
    intent_type: "EMAIL",
    deadline: "Within 4 Hours",
    entities: ["Strategic Ventures", "Product Lead"],
    urgency: 8.5,
    consequences: "Delayed stakeholder alignment and potential breach of client communication protocols.",
    stakes: "Account Health Risk",
    draft: "TO: lead@strategicventures.com\nSUBJECT: Integration Benchmark Update - Milestone Group Alpha\n\nDear Partners,\n\nWe are pleased to report that the core infrastructure and cloud replication nodes are fully operational. Telemetry indicates consistent data delivery across targeted sub-paths with zero downtime over the last sprint.\n\nWarm regards,\nSystem Automation Node",
    status: "executed",
    isCalendarEvent: false,
    isShadowChronos: false,
    isSmtpSimulated: false,
    isWorkspaceSynced: true,
    isNativeGmailApi: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3.8).toISOString()
  }
];

export const initialSystemLogs: SystemLog[] = [
  {
    id: "log-1",
    timestamp: "10:40:41.012",
    agentName: "System",
    message: "System environment initialized. Telemetry routing active.",
    type: "info"
  },
  {
    id: "log-2",
    timestamp: "10:40:42.105",
    agentName: "Triage Agent",
    message: "Analysis module standing by for unstructured input.",
    type: "action"
  },
  {
    id: "log-3",
    timestamp: "10:40:43.044",
    agentName: "Calibrator Agent",
    message: "Priority calibration nodes synchronized with local timeline.",
    type: "info"
  },
  {
    id: "log-4",
    timestamp: "10:40:43.890",
    agentName: "Proxy Agent",
    message: "Execution proxy ready. Awaiting workflow delegation.",
    type: "success"
  }
];