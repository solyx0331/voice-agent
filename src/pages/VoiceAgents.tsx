import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { VoiceAgentCard } from "@/components/dashboard/VoiceAgentCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";

const agents = [
  { name: "Sales Assistant", description: "Handles inbound sales inquiries", status: "busy" as const, calls: 156, avgDuration: "5:24" },
  { name: "Support Bot", description: "24/7 customer support", status: "active" as const, calls: 89, avgDuration: "3:12" },
  { name: "Booking Agent", description: "Appointment scheduling", status: "active" as const, calls: 45, avgDuration: "2:48" },
  { name: "Survey Caller", description: "Customer feedback collection", status: "inactive" as const, calls: 12, avgDuration: "1:56" },
  { name: "Lead Qualifier", description: "Qualify and score incoming leads", status: "active" as const, calls: 78, avgDuration: "4:15" },
  { name: "Reminder Bot", description: "Automated appointment reminders", status: "active" as const, calls: 234, avgDuration: "1:02" },
];

const VoiceAgents = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Voice Agents</h1>
              <p className="text-muted-foreground">Manage and monitor your AI voice agents</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <div key={agent.name} style={{ animationDelay: `${index * 0.1}s` }}>
                <VoiceAgentCard {...agent} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceAgents;
