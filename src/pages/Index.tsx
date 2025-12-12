import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VoiceAgentCard } from "@/components/dashboard/VoiceAgentCard";
import { RecentCallsTable } from "@/components/dashboard/RecentCallsTable";
import { LiveCallWidget } from "@/components/dashboard/LiveCallWidget";
import { Phone, Mic, Clock, TrendingUp, Plus } from "lucide-react";
import { useDashboardStats, useVoiceAgents } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: agents, isLoading: agentsLoading } = useVoiceAgents();

  const statsData = stats ? [
    { title: "Total Calls Today", value: stats.totalCallsToday.toString(), change: `${stats.callsChange > 0 ? '+' : ''}${stats.callsChange.toFixed(1)}% from yesterday`, changeType: (stats.callsChange > 0 ? "positive" : stats.callsChange < 0 ? "negative" : "neutral") as "positive" | "negative" | "neutral", icon: Phone },
    { title: "Active Agents", value: stats.activeAgents.toString(), change: `${stats.activeCallsCount || 0} currently on call`, changeType: "neutral" as "positive" | "negative" | "neutral", icon: Mic },
    { title: "Avg. Call Duration", value: stats.avgCallDuration, change: `${stats.durationChange > 0 ? '+' : ''}${stats.durationChange.toFixed(1)}% from last week`, changeType: (stats.durationChange > 0 ? "positive" : "negative") as "positive" | "negative" | "neutral", icon: Clock },
    { title: "Success Rate", value: `${stats.successRate.toFixed(1)}%`, change: `${stats.successRateChange > 0 ? '+' : ''}${stats.successRateChange.toFixed(1)}% this month`, changeType: (stats.successRateChange > 0 ? "positive" : "negative") as "positive" | "negative" | "neutral", icon: TrendingUp },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Page Title */}
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with your voice agents.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 sm:h-32 rounded-xl" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Voice Agents */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Voice Agents</h2>
                <button 
                  onClick={() => navigate("/voice-agents")}
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View All →
                </button>
              </div>
              {agentsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 sm:h-40 rounded-xl" />
                  ))}
                </div>
              ) : agents && agents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {agents.slice(0, 4).map((agent, index) => (
                    <div key={agent.id} className="h-full" style={{ animationDelay: `${index * 0.15}s` }}>
                      <VoiceAgentCard 
                        id={agent.id}
                        name={agent.name}
                        description={agent.description}
                        status={agent.status}
                        calls={agent.calls}
                        avgDuration={agent.avgDuration}
                        phoneNumber={agent.phoneNumber}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-xl p-8 sm:p-12 text-center border-border">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                      <Mic className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        No Voice Agents Yet
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                        Get started by creating your first voice agent. Set up AI-powered voice assistants to handle calls automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Call Widget */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Active Session</h2>
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
