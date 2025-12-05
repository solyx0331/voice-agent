// API Types
export interface Call {
  id: string;
  contact: string;
  phone: string;
  agent: string;
  type: "inbound" | "outbound" | "missed";
  duration: string;
  date: string;
  time: string;
  status: "completed" | "missed" | "voicemail";
  recording: boolean;
}

export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "busy";
  calls: number;
  avgDuration: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalCalls: number;
  lastContact: string;
  status: "active" | "inactive" | "lead";
}

export interface DashboardStats {
  totalCallsToday: number;
  activeAgents: number;
  avgCallDuration: string;
  successRate: number;
  callsChange: number;
  durationChange: number;
  successRateChange: number;
}

export interface LiveCall {
  id: string;
  contact: string;
  phone: string;
  agent: string;
  duration: number; // in seconds
  startTime: Date;
}

export interface AnalyticsData {
  callVolume: Array<{ name: string; calls: number }>;
  hourlyData: Array<{ hour: string; calls: number }>;
  agentPerformance: Array<{ name: string; calls: number; success: number }>;
  callTypeData: Array<{ name: string; value: number; color: string }>;
}

