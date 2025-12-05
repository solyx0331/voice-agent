import { Call, VoiceAgent, Contact, DashboardStats, LiveCall, AnalyticsData } from "./types";
import { mockCalls, mockAgents, mockContacts, mockDashboardStats, mockLiveCall, mockAnalyticsData } from "./mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Service
class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || "/api";

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(500);
    // Simulate slight variations
    return {
      ...mockDashboardStats,
      totalCallsToday: mockDashboardStats.totalCallsToday + Math.floor(Math.random() * 10),
    };
  }

  async getVoiceAgents(): Promise<VoiceAgent[]> {
    await delay(400);
    return mockAgents;
  }

  async getCalls(filters?: {
    search?: string;
    agent?: string;
    type?: string;
    dateRange?: { start: string; end: string };
  }): Promise<Call[]> {
    await delay(600);
    let calls = [...mockCalls];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      calls = calls.filter(
        call =>
          call.contact.toLowerCase().includes(searchLower) ||
          call.phone.includes(searchLower) ||
          call.agent.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.agent) {
      calls = calls.filter(call => call.agent === filters.agent);
    }

    if (filters?.type) {
      calls = calls.filter(call => call.type === filters.type);
    }

    return calls;
  }

  async getContacts(search?: string, status?: string): Promise<Contact[]> {
    await delay(400);
    let contacts = [...mockContacts];

    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.company.toLowerCase().includes(searchLower) ||
          contact.phone.includes(searchLower)
      );
    }

    if (status) {
      contacts = contacts.filter(contact => contact.status === status);
    }

    return contacts;
  }

  async getLiveCall(): Promise<LiveCall | null> {
    await delay(300);
    // Randomly return null to simulate no active call
    return Math.random() > 0.3 ? mockLiveCall : null;
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    await delay(500);
    return mockAnalyticsData;
  }

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    await delay(800);
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
    };
    mockContacts.push(newContact);
    return newContact;
  }

  async createAgent(agent: Omit<VoiceAgent, "id">): Promise<VoiceAgent> {
    await delay(800);
    const newAgent: VoiceAgent = {
      ...agent,
      id: Date.now().toString(),
    };
    mockAgents.push(newAgent);
    return newAgent;
  }

  async updateAgentStatus(agentId: string, status: VoiceAgent["status"]): Promise<VoiceAgent> {
    await delay(500);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error("Agent not found");
    agent.status = status;
    return agent;
  }

  async updateAgent(agentId: string, updates: Partial<Omit<VoiceAgent, "id">>): Promise<VoiceAgent> {
    await delay(600);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error("Agent not found");
    Object.assign(agent, updates);
    return agent;
  }

  async deleteAgent(agentId: string): Promise<void> {
    await delay(500);
    const index = mockAgents.findIndex(a => a.id === agentId);
    if (index === -1) throw new Error("Agent not found");
    mockAgents.splice(index, 1);
  }

  async getAgentDetails(agentId: string): Promise<VoiceAgent & { 
    createdAt: string;
    lastActive: string;
    totalCalls: number;
    successRate: number;
  }> {
    await delay(400);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error("Agent not found");
    return {
      ...agent,
      createdAt: "2024-01-15",
      lastActive: "2 hours ago",
      totalCalls: agent.calls,
      successRate: 94.5,
    };
  }

  async updateProfile(data: { firstName?: string; lastName?: string; email?: string; company?: string; timezone?: string }): Promise<void> {
    await delay(800);
    // In real app, this would update the user profile
    console.log("Profile updated:", data);
  }

  async updateVoiceSettings(data: { voiceModel?: string; speechSpeed?: number; apiKey?: string }): Promise<void> {
    await delay(800);
    // In real app, this would update voice settings
    console.log("Voice settings updated:", data);
  }

  async updateNotificationSettings(settings: Record<string, boolean>): Promise<void> {
    await delay(500);
    // In real app, this would update notification preferences
    console.log("Notification settings updated:", settings);
  }

  async endCall(callId: string): Promise<void> {
    await delay(500);
    // In real app, this would end the active call
    console.log("Call ended:", callId);
  }

  async toggleCallMute(callId: string, muted: boolean): Promise<void> {
    await delay(300);
    // In real app, this would toggle mute
    console.log("Call mute toggled:", callId, muted);
  }

  async playRecording(callId: string): Promise<string> {
    await delay(500);
    // In real app, this would return the recording URL
    return `https://example.com/recordings/${callId}.mp3`;
  }

  async exportCalls(format: "csv" | "json" = "csv"): Promise<Blob> {
    await delay(1000);
    const data = format === "csv" 
      ? this.convertToCSV(mockCalls)
      : JSON.stringify(mockCalls, null, 2);
    return new Blob([data], { type: format === "csv" ? "text/csv" : "application/json" });
  }

  async searchGlobal(query: string): Promise<{ agents: VoiceAgent[]; calls: Call[]; contacts: Contact[] }> {
    await delay(600);
    const queryLower = query.toLowerCase();
    return {
      agents: mockAgents.filter(a => 
        a.name.toLowerCase().includes(queryLower) || 
        a.description.toLowerCase().includes(queryLower)
      ),
      calls: mockCalls.filter(c => 
        c.contact.toLowerCase().includes(queryLower) ||
        c.phone.includes(queryLower) ||
        c.agent.toLowerCase().includes(queryLower)
      ),
      contacts: mockContacts.filter(c => 
        c.name.toLowerCase().includes(queryLower) ||
        c.email.toLowerCase().includes(queryLower) ||
        c.company.toLowerCase().includes(queryLower)
      ),
    };
  }

  private convertToCSV(calls: Call[]): string {
    const headers = ["Contact", "Phone", "Agent", "Type", "Duration", "Date", "Time", "Status"];
    const rows = calls.map(call => [
      call.contact,
      call.phone,
      call.agent,
      call.type,
      call.duration,
      call.date,
      call.time,
      call.status,
    ]);
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  }
}

export const apiService = new ApiService();
