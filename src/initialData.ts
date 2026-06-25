import { Task, SystemLog } from "./types";

export const initialTasks: Task[] = [
  {
    id: "task-1",
    userId: null,
    rawText: "I still haven't paid the City Power electric bill. It is due tomorrow and I am worried they might send a disconnect warning.",
    title: "Pay Electric Utility Bill",
    deadline: "Tomorrow by 5:00 PM",
    entities: ["City Power Corp", "Billing Department"],
    urgency: 9.2,
    consequences: "Power grid decoupling warning. Immediate loss of workstation servers, resulting in permanent data corruption indices and offline terminal lockdown.",
    stakes: "RISK: EMAIL BOSS MY UNFINISHED SEARCH HISTORY",
    draft: "TO: billing@citypower-billing.com\nSUBJECT: Account #X-481903 - Electronic Fund Dispatch Notice\n\nDear Billing Compliance,\n\nThis is to notify you that electronic transaction authorization has been completed for Account #X-481903 in the amount of $142.50. This payment fully settles the current billing cycle. Kindly note this to prevent scheduled default actions.\n\nDispatched from Agent Zero proxy vault.",
    status: "proxy_ready",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "task-2",
    userId: null,
    rawText: "Need to write a client project progress report, but I have no motivation and it's due soon.",
    title: "Draft Strategic Partner Progress Report",
    deadline: "Within 4 Hours",
    entities: ["Strategic Ventures", "Product Lead"],
    urgency: 8.5,
    consequences: "Client confidence erosion index rises. Threat of project scope curtailment and partner-level trust deficit penalties.",
    stakes: "RISK: TWEET EMBARRASSING PROGRESS DRAFT AUTOMATICALLY",
    draft: "TO: lead@strategicventures.com\nSUBJECT: Integration Benchmark Update - Milestone Group Alpha\n\nDear Partners,\n\nWe are pleased to report that the core full-stack routing and Firestore replication nodes are operational. Our microservice telemetry has verified consistent payload delivery across targeted sub-paths with zero downtime index.\n\nWarm regards,\nAutonomous Proxy Unit",
    status: "executed",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3.8).toISOString()
  }
];

export const initialSystemLogs: SystemLog[] = [
  {
    id: "log-1",
    timestamp: "10:40:41",
    agentName: "System",
    message: "Core Kernel initialized. Scribe processes activated.",
    type: "info"
  },
  {
    id: "log-2",
    timestamp: "10:40:42",
    agentName: "Triage Agent",
    message: "Semantic Triage engine scanning background threads...",
    type: "action"
  },
  {
    id: "log-3",
    timestamp: "10:40:43",
    agentName: "Calibrator Agent",
    message: "Urgency evaluation systems fully synchronized with local temporal matrix.",
    type: "info"
  },
  {
    id: "log-4",
    timestamp: "10:40:43",
    agentName: "Proxy Agent",
    message: "One-Click Draft compiler initialized. Listening on port 3000.",
    type: "success"
  }
];
