import { Call, VoiceAgent, Contact, DashboardStats, LiveCall, AnalyticsData } from "./types";

// API Service
class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async requestFile(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "ngrok-skip-browser-warning": "true",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Transform MongoDB document to frontend format
  private transformDocument<T extends { _id?: any; id?: string }>(doc: any): T {
    if (!doc) return doc;
    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString() || doc.id || _id,
    } as T;
  }

  private transformArray<T extends { _id?: any; id?: string }>(docs: any[]): T[] {
    return docs.map((doc) => this.transformDocument<T>(doc));
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/dashboard/stats");
  }

  async getVoiceAgents(): Promise<VoiceAgent[]> {
    const agents = await this.request<any[]>("/dashboard/agents");
    return this.transformArray<VoiceAgent>(agents);
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>("/dashboard/analytics");
  }

  async getLiveCall(): Promise<LiveCall | null> {
    const call = await this.request<LiveCall | null>("/dashboard/live-call");
    if (!call) return null;
    return {
      ...this.transformDocument<LiveCall>(call),
      startTime: new Date(call.startTime),
    };
  }

  async getLiveCalls(): Promise<LiveCall[]> {
    const calls = await this.request<any[]>("/dashboard/live-calls");
    return calls.map((call) => ({
      ...this.transformDocument<LiveCall>(call),
      startTime: new Date(call.startTime),
    }));
  }

  // Agents
  async getAgentDetails(agentId: string): Promise<VoiceAgent & {
    createdAt: string;
    lastActive: string;
    totalCalls: number;
    successRate: number;
  }> {
    const agent = await this.request<any>(`/agents/${agentId}`);
    return this.transformDocument<VoiceAgent & {
      createdAt: string;
      lastActive: string;
      totalCalls: number;
      successRate: number;
    }>(agent);
  }

  async getAgentCalls(agentId: string, limit?: number): Promise<Call[]> {
    const url = limit
      ? `/agents/${agentId}/calls?limit=${limit}`
      : `/agents/${agentId}/calls`;
    const calls = await this.request<any[]>(url);
    return this.transformArray<Call>(calls).map((call) => ({
      ...call,
      date: typeof call.date === "string" ? call.date : new Date(call.date).toISOString().split("T")[0],
    }));
  }

  async createAgent(agent: Omit<VoiceAgent, "id">): Promise<VoiceAgent> {
    // Remove fields that are set by the backend automatically
    const { calls, avgDuration, ...agentData } = agent;
    
    console.log("new agent", agent);
    console.log("new agentData", agentData);
    
    const created = await this.request<any>("/agents", {
      method: "POST",
      body: JSON.stringify(agentData),
    });
    return this.transformDocument<VoiceAgent>(created);
  }

  async updateAgent(agentId: string, updates: Partial<Omit<VoiceAgent, "id">>): Promise<VoiceAgent> {
    const updated = await this.request<any>(`/agents/${agentId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return this.transformDocument<VoiceAgent>(updated);
  }

  async updateAgentStatus(agentId: string, status: VoiceAgent["status"]): Promise<VoiceAgent> {
    const updated = await this.request<any>(`/agents/${agentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return this.transformDocument<VoiceAgent>(updated);
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.request(`/agents/${agentId}`, {
      method: "DELETE",
    });
  }

  // Calls
  async getCalls(filters?: {
    search?: string;
    agent?: string;
    type?: string;
    dateRange?: { start: string; end: string };
  }): Promise<Call[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.agent) params.append("agent", filters.agent);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.dateRange?.start) params.append("start", filters.dateRange.start);
    if (filters?.dateRange?.end) params.append("end", filters.dateRange.end);

    const url = `/calls${params.toString() ? `?${params.toString()}` : ""}`;
    const calls = await this.request<any[]>(url);
    return this.transformArray<Call>(calls).map((call) => ({
      ...call,
      date: typeof call.date === "string" ? call.date : new Date(call.date).toISOString().split("T")[0],
    }));
  }

  async transferCall(callId: string, targetAgentId: string): Promise<void> {
    await this.request(`/calls/${callId}/transfer`, {
      method: "POST",
      body: JSON.stringify({ targetAgentId }),
    });
  }

  async holdCall(callId: string, hold: boolean): Promise<void> {
    await this.request(`/calls/${callId}/hold`, {
      method: "POST",
      body: JSON.stringify({ hold }),
    });
  }

  async whisperToAgent(callId: string, message: string): Promise<void> {
    await this.request(`/calls/${callId}/whisper`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async interveneInCall(callId: string): Promise<void> {
    await this.request(`/calls/${callId}/intervene`, {
      method: "POST",
    });
  }

  async updateCallSentiment(callId: string, sentiment: "positive" | "neutral" | "negative"): Promise<void> {
    await this.request(`/calls/${callId}/sentiment`, {
      method: "PATCH",
      body: JSON.stringify({ sentiment }),
    });
  }

  async endCall(callId: string): Promise<void> {
    await this.request(`/calls/${callId}/end`, {
      method: "POST",
    });
  }

  async toggleCallMute(callId: string, muted: boolean): Promise<void> {
    await this.request(`/calls/${callId}/mute`, {
      method: "POST",
      body: JSON.stringify({ muted }),
    });
  }

  async playRecording(callId: string): Promise<string> {
    const result = await this.request<{ url: string }>(`/calls/${callId}/recording`);
    return result.url;
  }

  async exportCalls(format: "csv" | "json" = "csv"): Promise<Blob> {
    return this.requestFile(`/calls/export/${format}`);
  }

  // Contacts
  async getContacts(search?: string, status?: string): Promise<Contact[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const url = `/contacts${params.toString() ? `?${params.toString()}` : ""}`;
    const contacts = await this.request<any[]>(url);
    return this.transformArray<Contact>(contacts).map((contact) => ({
      ...contact,
      lastContact: typeof contact.lastContact === "string"
        ? contact.lastContact
        : contact.lastContact
        ? new Date(contact.lastContact).toISOString().split("T")[0]
        : "",
    }));
  }

  async getContactCalls(contactId: string): Promise<Call[]> {
    const calls = await this.request<any[]>(`/contacts/${contactId}/calls`);
    return this.transformArray<Call>(calls).map((call) => ({
      ...call,
      date: typeof call.date === "string" ? call.date : new Date(call.date).toISOString().split("T")[0],
    }));
  }

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const created = await this.request<any>("/contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });
    return this.transformDocument<Contact>(created);
  }

  async updateContact(contactId: string, updates: Partial<Omit<Contact, "id">>): Promise<Contact> {
    const updated = await this.request<any>(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return this.transformDocument<Contact>(updated);
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.request(`/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  // Upload
  async uploadVoiceFile(file: File): Promise<{ voiceId: string; url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/upload/voice`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async recordVoice(): Promise<{ blob: Blob; url: string }> {
    const result = await this.request<{ url: string }>("/upload/voice/record", {
      method: "POST",
    });
    // In a real implementation, you would fetch the blob from the URL
    const blob = new Blob(["mock audio data"], { type: "audio/webm" });
    return { blob, url: result.url };
  }

  // Settings
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    timezone?: string;
  }): Promise<void> {
    await this.request("/settings/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateVoiceSettings(data: {
    voiceModel?: string;
    speechSpeed?: number;
    apiKey?: string;
  }): Promise<void> {
    await this.request("/settings/voice", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(settings: Record<string, boolean>): Promise<void> {
    await this.request("/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request("/settings/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    return this.request<{ secret: string; qrCode: string }>("/settings/2fa/enable", {
      method: "POST",
    });
  }

  async disable2FA(): Promise<void> {
    await this.request("/settings/2fa/disable", {
      method: "POST",
    });
  }

  async verify2FA(code: string): Promise<void> {
    await this.request("/settings/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    return this.request<any[]>("/settings/sessions");
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.request(`/settings/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async getBillingInfo(): Promise<{
    plan: string;
    status: string;
    nextBillingDate: string;
    amount: string;
    paymentMethod: { type: string; last4: string; expiry: string };
  }> {
    return this.request("/settings/billing");
  }

  async updatePaymentMethod(data: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    name: string;
  }): Promise<void> {
    await this.request("/settings/billing/payment-method", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getInvoices(): Promise<Array<{
    id: string;
    date: string;
    amount: string;
    status: string;
    downloadUrl: string;
  }>> {
    return this.request<any[]>("/settings/billing/invoices");
  }

  async createApiKey(name: string): Promise<{
    id: string;
    key: string;
    name: string;
    createdAt: string;
  }> {
    return this.request("/settings/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getApiKeys(): Promise<Array<{
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
  }>> {
    return this.request<any[]>("/settings/api-keys");
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await this.request(`/settings/api-keys/${keyId}`, {
      method: "DELETE",
    });
  }

  async createWebhook(url: string, events: string[]): Promise<{
    id: string;
    url: string;
    events: string[];
    status: string;
  }> {
    return this.request("/settings/webhooks", {
      method: "POST",
      body: JSON.stringify({ url, events }),
    });
  }

  async getWebhooks(): Promise<Array<{
    id: string;
    url: string;
    events: string[];
    status: string;
    createdAt?: string;
  }>> {
    return this.request<any[]>("/settings/webhooks");
  }

  async updateWebhook(webhookId: string, updates: {
    url?: string;
    events?: string[];
    status?: string;
  }): Promise<void> {
    await this.request(`/settings/webhooks/${webhookId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request(`/settings/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }

  // Search
  async searchGlobal(query: string): Promise<{
    agents: VoiceAgent[];
    calls: Call[];
    contacts: Contact[];
  }> {
    const result = await this.request<{
      agents: any[];
      calls: any[];
      contacts: any[];
    }>(`/search?q=${encodeURIComponent(query)}`);

    return {
      agents: this.transformArray<VoiceAgent>(result.agents),
      calls: this.transformArray<Call>(result.calls).map((call) => ({
        ...call,
        date: typeof call.date === "string" ? call.date : new Date(call.date).toISOString().split("T")[0],
      })),
      contacts: this.transformArray<Contact>(result.contacts).map((contact) => ({
        ...contact,
        lastContact: typeof contact.lastContact === "string"
          ? contact.lastContact
          : contact.lastContact
          ? new Date(contact.lastContact).toISOString().split("T")[0]
          : "",
      })),
    };
  }

  // Voices
  async getAvailableVoices(): Promise<Array<{
    voice_id: string;
    voice_name: string;
    provider: string;
    display_name: string;
  }>> {
    return this.request<Array<{
      voice_id: string;
      voice_name: string;
      provider: string;
      display_name: string;
    }>>("/voices");
  }

  // Custom Voices Management
  async getCustomVoices(): Promise<Array<{
    id: string;
    name: string;
    voiceId: string;
    url: string;
    createdAt: string;
    type: "uploaded" | "recorded";
  }>> {
    return this.request<Array<{
      id: string;
      name: string;
      voiceId: string;
      url: string;
      createdAt: string;
      type: "uploaded" | "recorded";
    }>>("/voices/custom");
  }

  async uploadCustomVoice(file: File, name?: string): Promise<{
    id: string;
    name: string;
    voiceId: string;
    url: string;
    createdAt: string;
    type: "uploaded";
  }> {
    const formData = new FormData();
    formData.append("file", file);
    if (name) {
      formData.append("name", name);
    }

    const response = await fetch(`${this.baseUrl}/voices/custom`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteCustomVoice(voiceId: string): Promise<void> {
    await this.request(`/voices/custom/${voiceId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
