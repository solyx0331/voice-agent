import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Download, Filter, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Call {
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

const calls: Call[] = [
  { id: "1", contact: "John Smith", phone: "+1 (555) 123-4567", agent: "Sales Assistant", type: "inbound", duration: "4:32", date: "Dec 2, 2025", time: "10:24 AM", status: "completed", recording: true },
  { id: "2", contact: "Emma Wilson", phone: "+1 (555) 234-5678", agent: "Support Bot", type: "outbound", duration: "2:15", date: "Dec 2, 2025", time: "10:09 AM", status: "completed", recording: true },
  { id: "3", contact: "Michael Brown", phone: "+1 (555) 345-6789", agent: "Booking Agent", type: "missed", duration: "-", date: "Dec 2, 2025", time: "9:52 AM", status: "missed", recording: false },
  { id: "4", contact: "Sarah Davis", phone: "+1 (555) 456-7890", agent: "Sales Assistant", type: "inbound", duration: "6:48", date: "Dec 2, 2025", time: "9:30 AM", status: "completed", recording: true },
  { id: "5", contact: "James Miller", phone: "+1 (555) 567-8901", agent: "Support Bot", type: "outbound", duration: "1:23", date: "Dec 2, 2025", time: "9:15 AM", status: "completed", recording: true },
  { id: "6", contact: "Lisa Anderson", phone: "+1 (555) 678-9012", agent: "Lead Qualifier", type: "inbound", duration: "3:45", date: "Dec 1, 2025", time: "4:30 PM", status: "completed", recording: true },
  { id: "7", contact: "Robert Taylor", phone: "+1 (555) 789-0123", agent: "Booking Agent", type: "outbound", duration: "-", date: "Dec 1, 2025", time: "3:45 PM", status: "voicemail", recording: true },
  { id: "8", contact: "Jennifer White", phone: "+1 (555) 890-1234", agent: "Sales Assistant", type: "inbound", duration: "8:12", date: "Dec 1, 2025", time: "2:20 PM", status: "completed", recording: true },
];

const typeIcons = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  missed: PhoneMissed,
};

const typeColors = {
  inbound: "text-emerald-400",
  outbound: "text-primary",
  missed: "text-red-400",
};

const statusBadge = {
  completed: "bg-emerald-500/20 text-emerald-400",
  missed: "bg-red-500/20 text-red-400",
  voicemail: "bg-yellow-500/20 text-yellow-400",
};

const CallHistory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Call History</h1>
              <p className="text-muted-foreground">View and manage all call records</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Agent
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call Type
            </Button>
          </div>

          {/* Calls Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Contact</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Agent</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Duration</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Date & Time</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => {
                    const Icon = typeIcons[call.type];
                    return (
                      <tr key={call.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-medium text-foreground">{call.contact}</span>
                            <p className="text-sm text-muted-foreground">{call.phone}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{call.agent}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", typeColors[call.type])} />
                            <span className="capitalize text-muted-foreground">{call.type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{call.duration}</td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-foreground">{call.date}</span>
                            <p className="text-sm text-muted-foreground">{call.time}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusBadge[call.status])}>
                            {call.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {call.recording && (
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              Play Recording
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallHistory;
