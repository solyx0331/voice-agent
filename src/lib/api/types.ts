// API Types
export interface Call {
  id: string;
  contact: string;
  phone: string;
  agent: string;
  agentId?: string;
  type: "inbound" | "outbound" | "missed";
  duration: string;
  date: string;
  time: string;
  status: "completed" | "missed" | "voicemail";
  recording: boolean;
  outcome?: "success" | "caller_hung_up" | "speech_not_recognized" | "other";
  latency?: {
    avg: number; // milliseconds
    peak: number; // milliseconds
  };
  transcript?: Array<{
    speaker: "user" | "ai";
    text: string;
    timestamp: string;
  }>;
}

export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "busy";
  calls: number;
  avgDuration: string;
  // Enhanced configuration
  voice?: {
    type: "generic" | "custom";
    genericVoice?: string; // e.g., "ElevenLabs - Aria"
    customVoiceId?: string; // Retell voice ID
    customVoiceUrl?: string; // Uploaded voice file URL
  };
  greetingScript?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  intents?: Array<{
    name: string;
    prompt: string;
    response?: string;
  }>;
  callRules?: {
    businessHours: {
      enabled: boolean;
      timezone: string;
      schedule: Array<{
        day: string; // "monday", "tuesday", etc.
        start: string; // "09:00"
        end: string; // "17:00"
      }>;
    };
    fallbackToVoicemail: boolean;
    voicemailMessage?: string;
  };
  leadCapture?: {
    fields: Array<{
      name: string;
      question: string;
      required: boolean;
      type: "text" | "email" | "phone" | "number";
    }>;
  };
  notifications?: {
    email?: string;
    crm?: {
      type: "webhook" | "salesforce" | "hubspot" | "zapier";
      endpoint?: string;
      apiKey?: string;
    };
  };
  // Base Receptionist Logic
  baseLogic?: {
    greetingMessage: string;
    primaryIntentPrompts: string[];
    leadCaptureQuestions: Array<{
      question: string;
      field: string;
    }>;
    responseLogic?: Array<{
      condition: string;
      action: string;
      response: string;
    }>;
  };
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

