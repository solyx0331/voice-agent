import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { VoiceAgentCard } from "@/components/dashboard/VoiceAgentCard";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useVoiceAgents } from "@/hooks/useDashboard";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AgentStatus = "active" | "inactive" | "busy";

const VoiceAgents = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<AgentStatus[]>([]);
  const { data: agents, isLoading } = useVoiceAgents();

  const handleStatusFilter = (status: AgentStatus, checked: boolean) => {
    if (checked) {
      setStatusFilters([...statusFilters, status]);
    } else {
      setStatusFilters(statusFilters.filter(s => s !== status));
    }
  };

  const clearFilters = () => {
    setStatusFilters([]);
  };

  const activeFilterCount = statusFilters.length;

  const filteredAgents = agents?.filter(agent => {
    // Search filter
    const matchesSearch = search === "" || 
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(agent.status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <Header />
        
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Voice Agents</h1>
            <p className="text-muted-foreground">Manage and monitor your AI voice agents</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Filter Agents</h3>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-active"
                          checked={statusFilters.includes("active")}
                          onCheckedChange={(checked) => handleStatusFilter("active", checked as boolean)}
                        />
                        <Label
                          htmlFor="filter-active"
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-busy"
                          checked={statusFilters.includes("busy")}
                          onCheckedChange={(checked) => handleStatusFilter("busy", checked as boolean)}
                        />
                        <Label
                          htmlFor="filter-busy"
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Busy
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-inactive"
                          checked={statusFilters.includes("inactive")}
                          onCheckedChange={(checked) => handleStatusFilter("inactive", checked as boolean)}
                        />
                        <Label
                          htmlFor="filter-inactive"
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                          Inactive
                        </Label>
                      </div>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex flex-wrap gap-2">
                        {statusFilters.map(status => (
                          <Badge
                            key={status}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {status}
                            <button
                              onClick={() => handleStatusFilter(status, false)}
                              className="ml-1 hover:bg-secondary rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))
            ) : filteredAgents.length > 0 ? (
              filteredAgents.map((agent, index) => (
                <div key={agent.id} style={{ animationDelay: `${index * 0.1}s` }}>
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
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No agents found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceAgents;
