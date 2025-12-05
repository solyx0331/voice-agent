import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VoiceAgentCard } from "@/components/dashboard/VoiceAgentCard";
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable";
import { LiveCallWidget } from "@/components/dashboard/LiveCallWidget";
import { Phone, Mic, Clock, TrendingUp } from "lucide-react";

const stats = [
  { title: "Total Calls Today", value: "247", change: "+12% from yesterday", changeType: "positive" as const, icon: Phone },
  { title: "Active Agents", value: "8", change: "3 currently on call", changeType: "neutral" as const, icon: Mic },
  { title: "Avg. Call Duration", value: "4:32", change: "-8% from last week", changeType: "positive" as const, icon: Clock },
  { title: "Success Rate", value: "94.2%", change: "+2.1% this month", changeType: "positive" as const, icon: TrendingUp },
];

const agents = [
  { name: "Sales Assistant", description: "Handles inbound sales inquiries", status: "busy" as const, calls: 156, avgDuration: "5:24" },
  { name: "Support Bot", description: "24/7 customer support", status: "active" as const, calls: 89, avgDuration: "3:12" },
  { name: "Booking Agent", description: "Appointment scheduling", status: "active" as const, calls: 45, avgDuration: "2:48" },
  { name: "Survey Caller", description: "Customer feedback collection", status: "inactive" as const, calls: 12, avgDuration: "1:56" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          {/* Page Title */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your voice agents.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice Agents */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Voice Agents</h2>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent, index) => (
                  <div key={agent.name} style={{ animationDelay: `${index * 0.15}s` }}>
                    <VoiceAgentCard {...agent} />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Call Widget */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Active Session</h2>
              <LiveCallWidget />
            </div>
          </div>

          {/* Recent Calls */}
          <RecentCallsTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
