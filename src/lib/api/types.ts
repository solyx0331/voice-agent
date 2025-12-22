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
  // Custom routing actions
  customRoutingActions?: string[]; // User-defined custom routing actions (e.g., "schedule-appointment", "check-status")

  // Base Receptionist Logic
  baseLogic?: {
    greetingMessage: string;
    // Global route handlers for special actions (opt-out, transfer, etc.)
    globalRouteHandlers?: Array<{
      id: string;
      action: string; // e.g., "opt-out", "transfer", "emergency"
      condition?: string; // Optional condition for when to trigger
      response: string; // Response message
      followUpPrompt?: string; // Optional follow-up after handler
      endCall?: boolean; // Whether to end call after handler
    }>;
    routingLogics?: Array<{
      id: string;
      name: string;
      condition: string; // Condition to match (e.g., "caller says 'Evolved Sound'")
      // Enhanced conditional routing
      conditionalLogic?: {
        type: "field-value" | "intent-confidence" | "custom-expression";
        fieldName?: string; // For field-value type
        operator?: "equals" | "contains" | "greater-than" | "less-than" | "exists" | "not-exists";
        value?: any; // Comparison value
        intentName?: string; // For intent-confidence type
        minConfidence?: number; // For intent-confidence type (0-1)
        expression?: string; // For custom-expression type (e.g., "field.email && field.phone")
      };
      action: string; // Routing action (e.g., "callback", "quote", "continue-flow")
      response: string; // Initial response message
      followUpPrompt?: string; // Prompt after initial response
      informationGathering: Array<{
        question: string;
      }>;
      completionResponse?: string; // Response after collecting information/lead data
      // Inline fallback/escalation logic per route
      fallback?: {
        enabled: boolean;
        maxAttempts?: number; // Number of failed attempts before fallback
        fallbackMessage?: string; // Message when fallback triggers
        escalationAction?: string; // Action to take (e.g., "transfer", "voicemail", "end-call")
        escalationMessage?: string; // Message for escalation
      };
      // End condition flag
      endCondition?: {
        enabled: boolean;
        condition?: string; // Condition to end flow early (e.g., "allRequiredFieldsFilled")
        endMessage?: string; // Final message before ending
      };
      // Intent associations
      associatedIntents?: string[]; // Array of intent IDs that trigger this route
      // Display order for sequential steps
      displayOrder?: number;
      // Field schemas specific to this routing logic block
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
      routingLogics?: Array<any>; // Recursive type for nested routing
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

