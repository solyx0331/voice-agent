import { Call, VoiceAgent, Contact, DashboardStats, LiveCall, AnalyticsData } from "./types";

// Mock data generators
export const mockCalls: Call[] = [
  { id: "1", contact: "John Smith", phone: "+1 (555) 123-4567", agent: "Sales Assistant", type: "inbound", duration: "4:32", date: "Dec 2, 2025", time: "10:24 AM", status: "completed", recording: true },
  { id: "2", contact: "Emma Wilson", phone: "+1 (555) 234-5678", agent: "Support Bot", type: "outbound", duration: "2:15", date: "Dec 2, 2025", time: "10:09 AM", status: "completed", recording: true },
  { id: "3", contact: "Michael Brown", phone: "+1 (555) 345-6789", agent: "Booking Agent", type: "missed", duration: "-", date: "Dec 2, 2025", time: "9:52 AM", status: "missed", recording: false },
  { id: "4", contact: "Sarah Davis", phone: "+1 (555) 456-7890", agent: "Sales Assistant", type: "inbound", duration: "6:48", date: "Dec 2, 2025", time: "9:30 AM", status: "completed", recording: true },
  { id: "5", contact: "James Miller", phone: "+1 (555) 567-8901", agent: "Support Bot", type: "outbound", duration: "1:23", date: "Dec 2, 2025", time: "9:15 AM", status: "completed", recording: true },
  { id: "6", contact: "Lisa Anderson", phone: "+1 (555) 678-9012", agent: "Lead Qualifier", type: "inbound", duration: "3:45", date: "Dec 1, 2025", time: "4:30 PM", status: "completed", recording: true },
  { id: "7", contact: "Robert Taylor", phone: "+1 (555) 789-0123", agent: "Booking Agent", type: "outbound", duration: "-", date: "Dec 1, 2025", time: "3:45 PM", status: "voicemail", recording: true },
  { id: "8", contact: "Jennifer White", phone: "+1 (555) 890-1234", agent: "Sales Assistant", type: "inbound", duration: "8:12", date: "Dec 1, 2025", time: "2:20 PM", status: "completed", recording: true },
];

export const mockAgents: VoiceAgent[] = [
  { id: "1", name: "Sales Assistant", description: "Handles inbound sales inquiries", status: "busy", calls: 156, avgDuration: "5:24" },
  { id: "2", name: "Support Bot", description: "24/7 customer support", status: "active", calls: 89, avgDuration: "3:12" },
  { id: "3", name: "Booking Agent", description: "Appointment scheduling", status: "active", calls: 45, avgDuration: "2:48" },
  { id: "4", name: "Survey Caller", description: "Customer feedback collection", status: "inactive", calls: 12, avgDuration: "1:56" },
  { id: "5", name: "Lead Qualifier", description: "Qualify and score incoming leads", status: "active", calls: 78, avgDuration: "4:15" },
  { id: "6", name: "Reminder Bot", description: "Automated appointment reminders", status: "active", calls: 234, avgDuration: "1:02" },
];

export const mockContacts: Contact[] = [
  { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "+1 (555) 123-4567", company: "Tech Corp", totalCalls: 12, lastContact: "2 hours ago", status: "active" },
  { id: "2", name: "Emma Wilson", email: "emma.w@company.com", phone: "+1 (555) 234-5678", company: "Design Studio", totalCalls: 8, lastContact: "1 day ago", status: "active" },
  { id: "3", name: "Michael Brown", email: "m.brown@startup.io", phone: "+1 (555) 345-6789", company: "StartUp Inc", totalCalls: 3, lastContact: "3 days ago", status: "lead" },
  { id: "4", name: "Sarah Davis", email: "sarah.d@enterprise.com", phone: "+1 (555) 456-7890", company: "Enterprise Co", totalCalls: 24, lastContact: "5 hours ago", status: "active" },
  { id: "5", name: "James Miller", email: "james@consulting.net", phone: "+1 (555) 567-8901", company: "Consulting Group", totalCalls: 6, lastContact: "1 week ago", status: "inactive" },
  { id: "6", name: "Lisa Anderson", email: "l.anderson@media.co", phone: "+1 (555) 678-9012", company: "Media House", totalCalls: 15, lastContact: "4 hours ago", status: "active" },
];

export const mockDashboardStats: DashboardStats = {
  totalCallsToday: 247,
  activeAgents: 8,
  avgCallDuration: "4:32",
  successRate: 94.2,
  callsChange: 12,
  durationChange: -8,
  successRateChange: 2.1,
};

export const mockLiveCall: LiveCall | null = {
  id: "live-1",
  contact: "Jennifer Adams",
  phone: "+61 412 345 678",
  agent: "Sales Assistant",
  duration: 204, // 3:24 in seconds
  startTime: new Date(Date.now() - 204000),
};

export const mockAnalyticsData: AnalyticsData = {
  callVolume: [
    { name: "Mon", calls: 420 },
    { name: "Tue", calls: 380 },
    { name: "Wed", calls: 510 },
    { name: "Thu", calls: 470 },
    { name: "Fri", calls: 590 },
    { name: "Sat", calls: 280 },
    { name: "Sun", calls: 190 },
  ],
  hourlyData: [
    { hour: "8AM", calls: 45 },
    { hour: "9AM", calls: 78 },
    { hour: "10AM", calls: 92 },
    { hour: "11AM", calls: 85 },
    { hour: "12PM", calls: 65 },
    { hour: "1PM", calls: 72 },
    { hour: "2PM", calls: 88 },
    { hour: "3PM", calls: 95 },
    { hour: "4PM", calls: 82 },
    { hour: "5PM", calls: 58 },
  ],
  agentPerformance: [
    { name: "Sales Assistant", calls: 456, success: 94 },
    { name: "Support Bot", calls: 389, success: 91 },
    { name: "Booking Agent", calls: 234, success: 97 },
    { name: "Lead Qualifier", calls: 178, success: 88 },
  ],
  callTypeData: [
    { name: "Inbound", value: 58, color: "#10b981" },
    { name: "Outbound", value: 32, color: "#13abe3" },
    { name: "Missed", value: 10, color: "#ef4444" },
  ],
};

