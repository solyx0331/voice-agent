import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Phone, Clock, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const stats = [
  { title: "Total Calls", value: "12,847", change: "+18% from last month", changeType: "positive" as const, icon: Phone },
  { title: "Avg. Handle Time", value: "3:45", change: "-12% improvement", changeType: "positive" as const, icon: Clock },
  { title: "Resolution Rate", value: "92.4%", change: "+5.2% this month", changeType: "positive" as const, icon: TrendingUp },
  { title: "Unique Contacts", value: "3,421", change: "+234 new this week", changeType: "positive" as const, icon: Users },
];

const callVolumeData = [
  { name: "Mon", calls: 420 },
  { name: "Tue", calls: 380 },
  { name: "Wed", calls: 510 },
  { name: "Thu", calls: 470 },
  { name: "Fri", calls: 590 },
  { name: "Sat", calls: 280 },
  { name: "Sun", calls: 190 },
];

const hourlyData = [
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
];

const agentPerformance = [
  { name: "Sales Assistant", calls: 456, success: 94 },
  { name: "Support Bot", calls: 389, success: 91 },
  { name: "Booking Agent", calls: 234, success: 97 },
  { name: "Lead Qualifier", calls: 178, success: 88 },
];

const callTypeData = [
  { name: "Inbound", value: 58, color: "#10b981" },
  { name: "Outbound", value: 32, color: "#13abe3" },
  { name: "Missed", value: 10, color: "#ef4444" },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">Track performance and insights</p>
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 Days
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Volume Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Call Volume (This Week)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={callVolumeData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13abe3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#13abe3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f9fafb' }}
                  />
                  <Area type="monotone" dataKey="calls" stroke="#13abe3" fillOpacity={1} fill="url(#colorCalls)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Distribution */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Peak Hours (Today)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f9fafb' }}
                  />
                  <Bar dataKey="calls" fill="#13abe3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Performance */}
            <div className="lg:col-span-2 glass-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Agent Performance</h3>
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
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
            </div>

            {/* Call Type Distribution */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Call Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={callTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {callTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {callTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
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
