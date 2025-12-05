import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Phone, Clock, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Analytics = () => {
  const { data: analyticsData, isLoading } = useAnalytics();

  const stats = analyticsData ? [
    { title: "Total Calls", value: analyticsData.callVolume.reduce((sum, d) => sum + d.calls, 0).toLocaleString(), change: "+18% from last month", changeType: "positive" as const, icon: Phone },
    { title: "Avg. Handle Time", value: "3:45", change: "-12% improvement", changeType: "positive" as const, icon: Clock },
    { title: "Resolution Rate", value: "92.4%", change: "+5.2% this month", changeType: "positive" as const, icon: TrendingUp },
    { title: "Unique Contacts", value: "3,421", change: "+234 new this week", changeType: "positive" as const, icon: Users },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track performance and insights</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 7 Days
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Date range: Last 7 Days")}>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Date range: Last 30 Days")}>Last 30 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Date range: Last 90 Days")}>Last 90 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Date range: Custom")}>Custom Range</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 sm:h-32 rounded-xl" />
              ))
            ) : (
              stats.map((stat, index) => (
                <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                  <StatsCard {...stat} />
                </div>
              ))
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Call Volume Chart */}
            <div className="glass-card rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Call Volume (This Week)</h3>
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analyticsData?.callVolume || []}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13abe3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#13abe3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ color: '#1f2937' }}
                  />
                    <Area type="monotone" dataKey="calls" stroke="#13abe3" fillOpacity={1} fill="url(#colorCalls)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Hourly Distribution */}
            <div className="glass-card rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Peak Hours (Today)</h3>
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.hourlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ color: '#1f2937' }}
                  />
                    <Bar dataKey="calls" fill="#13abe3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Agent Performance */}
            <div className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Agent Performance</h3>
              {isLoading ? (
                <Skeleton className="h-40 sm:h-48 w-full" />
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {(analyticsData?.agentPerformance || []).map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground font-medium">{agent.name}</span>
                        <span className="text-muted-foreground text-sm">{agent.calls} calls</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                          style={{ width: `${agent.success}%` }}
                        />
                      </div>
                    </div>
                        <span className="ml-4 text-emerald-400 font-semibold">{agent.success}%</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Call Type Distribution */}
            <div className="glass-card rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Call Distribution</h3>
              {isLoading ? (
                <Skeleton className="h-[180px] sm:h-[200px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.callTypeData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                      {(analyticsData?.callTypeData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
                {(analyticsData?.callTypeData || []).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs sm:text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
