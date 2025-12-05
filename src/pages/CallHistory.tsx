import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Download, Filter, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalls } from "@/hooks/useCalls";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [isAgentFilterOpen, setIsAgentFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  const { data: calls, isLoading } = useCalls({
    search: search || undefined,
    agent: selectedAgent,
    type: selectedType as "inbound" | "outbound" | "missed" | undefined,
  });

  const handleExport = async () => {
    try {
      const { apiService } = await import("@/lib/api/api");
      const blob = await apiService.exportCalls("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calls-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Calls exported successfully");
    } catch (error) {
      toast.error("Failed to export calls");
    }
  };

  const uniqueAgents = Array.from(new Set(calls?.map(c => c.agent) || []));

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
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search calls..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Popover open={isAgentFilterOpen} onOpenChange={setIsAgentFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={selectedAgent ? "default" : "outline"} 
                  size="sm"
                  className="relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Agent
                  {selectedAgent && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      1
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Filter by Agent</h3>
                    {selectedAgent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(undefined);
                          setIsAgentFilterOpen(false);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <select
                    value={selectedAgent || ""}
                    onChange={(e) => {
                      setSelectedAgent(e.target.value || undefined);
                      if (e.target.value) {
                        setIsAgentFilterOpen(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Agents</option>
                    {uniqueAgents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                  {selectedAgent && (
                    <div className="pt-2 border-t">
                      <Badge variant="secondary" className="text-xs">
                        {selectedAgent}
                        <button
                          onClick={() => setSelectedAgent(undefined)}
                          className="ml-1 hover:bg-secondary rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={isTypeFilterOpen} onOpenChange={setIsTypeFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={selectedType ? "default" : "outline"} 
                  size="sm"
                  className="relative"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Type
                  {selectedType && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      1
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Filter by Call Type</h3>
                    {selectedType && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedType(undefined);
                          setIsTypeFilterOpen(false);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedType(undefined);
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedType 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-secondary"
                      )}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType("inbound");
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                        selectedType === "inbound"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneIncoming className={cn("h-4 w-4", selectedType === "inbound" ? "text-emerald-400" : "text-emerald-400")} />
                      Inbound
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType("outbound");
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                        selectedType === "outbound"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneOutgoing className={cn("h-4 w-4", selectedType === "outbound" ? "text-primary" : "text-primary")} />
                      Outbound
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType("missed");
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                        selectedType === "missed"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneMissed className={cn("h-4 w-4", selectedType === "missed" ? "text-red-400" : "text-red-400")} />
                      Missed
                    </button>
                  </div>
                  {selectedType && (
                    <div className="pt-2 border-t">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {selectedType}
                        <button
                          onClick={() => setSelectedType(undefined)}
                          className="ml-1 hover:bg-secondary rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : calls && calls.length > 0 ? (
                    calls.map((call) => {
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                onClick={async () => {
                                  try {
                                    const recordingUrl = await apiService.playRecording(call.id);
                                    toast.success("Opening recording...");
                                    // In real app, this would open an audio player
                                    window.open(recordingUrl, "_blank");
                                  } catch (error) {
                                    toast.error("Failed to load recording");
                                  }
                                }}
                              >
                                Play Recording
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                        No calls found
                      </td>
                    </tr>
                  )}
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
