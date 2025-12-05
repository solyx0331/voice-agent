import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VoiceAgentCard } from "@/components/dashboard/VoiceAgentCard";
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable";
import { LiveCallWidget } from "@/components/dashboard/LiveCallWidget";
import { Phone, Mic, Clock, TrendingUp } from "lucide-react";
import { useDashboardStats, useVoiceAgents } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: agents, isLoading: agentsLoading } = useVoiceAgents();

  const statsData = stats ? [
    { title: "Total Calls Today", value: stats.totalCallsToday.toString(), change: `${stats.callsChange > 0 ? '+' : ''}${stats.callsChange}% from yesterday`, changeType: (stats.callsChange > 0 ? "positive" : stats.callsChange < 0 ? "negative" : "neutral") as const, icon: Phone },
    { title: "Active Agents", value: stats.activeAgents.toString(), change: "3 currently on call", changeType: "neutral" as const, icon: Mic },
    { title: "Avg. Call Duration", value: stats.avgCallDuration, change: `${stats.durationChange > 0 ? '+' : ''}${stats.durationChange}% from last week`, changeType: (stats.durationChange > 0 ? "positive" : "negative") as const, icon: Clock },
    { title: "Success Rate", value: `${stats.successRate}%`, change: `${stats.successRateChange > 0 ? '+' : ''}${stats.successRateChange}% this month`, changeType: (stats.successRateChange > 0 ? "positive" : "negative") as const, icon: TrendingUp },
  ] : [];

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
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              statsData.map((stat, index) => (
                <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                  <StatsCard {...stat} />
                </div>
              ))
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice Agents */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Voice Agents</h2>
                <button 
                  onClick={() => navigate("/voice-agents")}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))
                ) : (
                  agents?.slice(0, 4).map((agent, index) => (
                    <div key={agent.id} style={{ animationDelay: `${index * 0.15}s` }}>
                      <VoiceAgentCard 
                        id={agent.id}
                        name={agent.name}
                        description={agent.description}
                        status={agent.status}
                        calls={agent.calls}
                        avgDuration={agent.avgDuration}
                      />
                    </div>
                  ))
                )}
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
