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
  // Retell-specific fields
  retellCallId?: string; // Retell call ID for tracking
  twilioCallSid?: string; // Twilio Call SID for tracking
  recordingUrl?: string; // URL to call recording (if available)
  callAnalysis?: {
    sentiment?: "positive" | "neutral" | "negative" | "unknown";
    summary?: string;
    extractedData?: Record<string, any>;
  };
  callCost?: {
    total?: number;
    currency?: string;
  };
  disconnectionReason?: string; // Reason for call end
  startTime?: string; // Actual call start time (ISO string)
  endTime?: string; // Actual call end time (ISO string)
}

export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string; // Custom system prompt for the agent
  status: "active" | "inactive" | "busy";
  calls: number;
  avgDuration: string;
  // Phone number configuration
  phoneNumber?: string; // Twilio phone number in E.164 format (e.g., +61412345678)
  twilioPhoneNumberSid?: string; // Twilio Phone Number SID
  webhookUrl?: string; // Webhook URL configured for the phone number
  // Retell IDs
  retellAgentId?: string; // Retell Agent ID
  retellLlmId?: string; // Retell LLM ID
  // Enhanced configuration
  voice?: {
    type: "generic" | "custom";
    genericVoice?: string; // e.g., "ElevenLabs - Aria"
    customVoiceId?: string; // Retell voice ID
    customVoiceUrl?: string; // Uploaded voice file URL
    temperature?: number; // Voice stability (0-2)
    speed?: number; // Speech speed (0.5-2)
    volume?: number; // Volume level (0-2)
  };
  greetingScript?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  // Legacy intents (for backward compatibility)
  intents?: Array<{
    name: string;
    prompt: string;
    response?: string;
  }>;

  // Dynamic Intent Definitions (new schema)
  intentDefinitions?: Array<{
    id: string;
    name: string;
    sampleUtterances: string[];
    matchingType: "semantic" | "regex";
    routingAction: string;
    enabled: boolean;
    confidenceThreshold?: number;
    regexPattern?: string;
    description?: string;
  }>;

  // Field Schema Definitions (new schema)
  fieldSchemas?: Array<{
    id: string;
    label: string;
    fieldName: string;
    dataType: "text" | "phone" | "email" | "number" | "choice" | "date" | "boolean";
    required: boolean;
    displayOrder: number;
    promptText?: string;
    nlpExtractionHints?: string[];
    validationRules?: {
      regex?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: string;
      errorMessage?: string;
    };
    choiceOptions?: string[];
    defaultValue?: string;
    description?: string;
  }>;

  // Schema version for migration/compatibility
  schemaVersion?: string;
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
    secondAttemptMessage?: string;
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
  emailTemplate?: {
    subjectFormat: string;
    bodyTemplate: string;
    fields?: Array<{
      label: string;
      fieldName: string;
      includeInEmail: boolean;
    }>;
  };
  // Ambient sound settings
  ambientSound?: "coffee-shop" | "convention-hall" | "summer-outdoor" | "mountain-outdoor" | "static-noise" | "call-center"; // Ambient background sound type
  ambientSoundVolume?: number; // Ambient sound volume (0-2, default: 1)
  // Call recording settings
  enableRecording?: boolean; // Whether to record calls (default: true)

  // Base Receptionist Logic
  baseLogic?: {
    greetingMessage: string;
    routingLogics?: Array<{
      id: string;
      name: string;
      condition: string;
      action: string;
      response: string;
      informationGathering: Array<{
        question: string;
      }>;
      leadCaptureFields: Array<{
        name: string;
        question: string;
        required: boolean;
        type: "text" | "email" | "phone" | "number";
      }>;
      completionResponse?: string; // Response after collecting information/lead data
      routingLogics?: Array<{
        id: string;
        name: string;
        condition: string;
        action: string;
        response: string;
        informationGathering: Array<{
          question: string;
        }>;
        leadCaptureFields: Array<{
          name: string;
          question: string;
          required: boolean;
          type: "text" | "email" | "phone" | "number";
        }>;
        completionResponse?: string; // Response after collecting information/lead data
        routingLogics?: Array<any>; // Recursive type for deeper nesting
      }>;
    }>;
    // Legacy fields for backward compatibility
    primaryIntentPrompts?: string[];
    leadCaptureQuestions?: Array<{
      question: string;
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
  activeCallsCount?: number;
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
  agentId?: string;
  duration: number; // in seconds
  startTime: Date;
  type?: "inbound" | "outbound";
  status?: "active" | "on_hold" | "transferring";
  transcript?: Array<{
    speaker: "user" | "ai";
    text: string;
    timestamp: string;
  }>;
  sentiment?: "positive" | "neutral" | "negative";
  isMuted?: boolean;
  isOnHold?: boolean;
}

export interface AnalyticsData {
  callVolume: Array<{ name: string; calls: number }>;
  hourlyData: Array<{ hour: string; calls: number }>;
  agentPerformance: Array<{ name: string; calls: number; success: number }>;
  callTypeData: Array<{ name: string; value: number; color: string }>;
  avgHandleTime?: string;
  avgHandleTimeChange?: number;
  resolutionRate?: number;
  resolutionRateChange?: number;
  uniqueContacts?: number;
  uniqueContactsChange?: number;
  totalCallsChange?: number;
}

export interface CustomVoice {
  id: string;
  name: string;
  voiceId: string; // Retell voice ID
  url: string; // Voice file URL
  createdAt: string;
  type: "uploaded" | "recorded";
}

