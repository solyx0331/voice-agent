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

  async updateContact(contactId: string, updates: Partial<Omit<Contact, "id">>): Promise<Contact> {
    await delay(600);
    const contact = mockContacts.find(c => c.id === contactId);
    if (!contact) throw new Error("Contact not found");
    Object.assign(contact, updates);
    return contact;
  }

  async deleteContact(contactId: string): Promise<void> {
    await delay(500);
    const index = mockContacts.findIndex(c => c.id === contactId);
    if (index === -1) throw new Error("Contact not found");
    mockContacts.splice(index, 1);
  }

  async getContactCalls(contactId: string): Promise<Call[]> {
    await delay(400);
    const contact = mockContacts.find(c => c.id === contactId);
    if (!contact) throw new Error("Contact not found");
    // Filter calls by contact name or phone
    return mockCalls.filter(call => 
      call.contact === contact.name || call.phone === contact.phone
    );
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

  async getAgentCalls(agentId: string, limit?: number): Promise<Call[]> {
    await delay(400);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error("Agent not found");
    let calls = mockCalls.filter(call => call.agent === agent.name || call.agentId === agentId);
    if (limit) {
      calls = calls.slice(0, limit);
    }
    return calls;
  }

  async uploadVoiceFile(file: File): Promise<{ voiceId: string; url: string }> {
    await delay(1500);
    // Simulate file upload
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }
    if (!file.type.startsWith("audio/")) {
      throw new Error("Please upload an audio file");
    }
    const voiceId = `voice_${Date.now()}`;
    const url = URL.createObjectURL(file);
    return { voiceId, url };
  }

  async recordVoice(): Promise<{ blob: Blob; url: string }> {
    // In real app, this would use Web Audio API to record
    await delay(1000);
    const blob = new Blob(["mock audio data"], { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    return { blob, url };
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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay(800);
    if (currentPassword.length < 6) {
      throw new Error("Current password is incorrect");
    }
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    console.log("Password changed successfully");
  }

  async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    await delay(600);
    return {
      secret: "JBSWY3DPEHPK3PXP",
      qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==",
    };
  }

  async disable2FA(): Promise<void> {
    await delay(500);
    console.log("2FA disabled");
  }

  async verify2FA(code: string): Promise<void> {
    await delay(500);
    if (code.length !== 6) {
      throw new Error("Invalid verification code");
    }
    console.log("2FA verified");
  }

  async getActiveSessions(): Promise<Array<{ id: string; device: string; location: string; lastActive: string; current: boolean }>> {
    await delay(400);
    return [
      { id: "1", device: "Chrome on Windows", location: "San Francisco, CA", lastActive: "Active now", current: true },
      { id: "2", device: "Safari on iPhone", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
      { id: "3", device: "Chrome on Mac", location: "New York, NY", lastActive: "1 day ago", current: false },
    ];
  }

  async revokeSession(sessionId: string): Promise<void> {
    await delay(400);
    console.log("Session revoked:", sessionId);
  }

  async getBillingInfo(): Promise<{
    plan: string;
    status: string;
    nextBillingDate: string;
    amount: string;
    paymentMethod: { type: string; last4: string; expiry: string };
  }> {
    await delay(400);
    return {
      plan: "Professional",
      status: "active",
      nextBillingDate: "2024-08-15",
      amount: "$99.00",
      paymentMethod: { type: "card", last4: "4242", expiry: "12/25" },
    };
  }

  async updatePaymentMethod(data: { cardNumber: string; expiry: string; cvv: string; name: string }): Promise<void> {
    await delay(800);
    if (data.cardNumber.length < 16) {
      throw new Error("Invalid card number");
    }
    console.log("Payment method updated");
  }

  async getInvoices(): Promise<Array<{ id: string; date: string; amount: string; status: string; downloadUrl: string }>> {
    await delay(400);
    return [
      { id: "INV-001", date: "2024-07-15", amount: "$99.00", status: "paid", downloadUrl: "#" },
      { id: "INV-002", date: "2024-06-15", amount: "$99.00", status: "paid", downloadUrl: "#" },
      { id: "INV-003", date: "2024-05-15", amount: "$99.00", status: "paid", downloadUrl: "#" },
    ];
  }

  async createApiKey(name: string): Promise<{ id: string; key: string; name: string; createdAt: string }> {
    await delay(600);
    const key = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: Date.now().toString(),
      key,
      name,
      createdAt: new Date().toISOString().split("T")[0],
    };
  }

  async getApiKeys(): Promise<Array<{ id: string; name: string; key: string; createdAt: string; lastUsed: string }>> {
    await delay(400);
    return [
      { id: "1", name: "Production API Key", key: "sk_live_...abc123", createdAt: "2024-01-15", lastUsed: "2 hours ago" },
      { id: "2", name: "Development API Key", key: "sk_test_...xyz789", createdAt: "2024-06-01", lastUsed: "1 week ago" },
    ];
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await delay(400);
    console.log("API key deleted:", keyId);
  }

  async createWebhook(url: string, events: string[]): Promise<{ id: string; url: string; events: string[]; status: string }> {
    await delay(600);
    return {
      id: Date.now().toString(),
      url,
      events,
      status: "active",
    };
  }

  async getWebhooks(): Promise<Array<{ id: string; url: string; events: string[]; status: string; createdAt: string }>> {
    await delay(400);
    return [
      { id: "1", url: "https://example.com/webhook", events: ["call.completed", "agent.status_changed"], status: "active", createdAt: "2024-07-01" },
      { id: "2", url: "https://app.example.com/hooks", events: ["call.started"], status: "inactive", createdAt: "2024-06-15" },
    ];
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await delay(400);
    console.log("Webhook deleted:", webhookId);
  }

  async updateWebhook(webhookId: string, updates: { url?: string; events?: string[]; status?: string }): Promise<void> {
    await delay(500);
    console.log("Webhook updated:", webhookId, updates);
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
