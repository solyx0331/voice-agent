import { Bell, Search, Plus, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateAgent } from "@/hooks/useVoiceAgents";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";
import { AgentConfigDialog } from "@/components/dashboard/AgentConfigDialog";
import { VoiceAgent } from "@/lib/api/types";

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ agents: any[]; calls: any[]; contacts: any[] } | null>(null);
  const createAgent = useCreateAgent();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await apiService.searchGlobal(query);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleCreateAgent = async (agentData: Partial<VoiceAgent>) => {
    try {

      console.log("agent data", agentData);
      await createAgent.mutateAsync({
        ...agentData,
        calls: 0,
        avgDuration: "0:00",
      } as Omit<VoiceAgent, "id">);
      toast.success("Agent created successfully");
      setIsAgentDialogOpen(false);
      navigate("/voice-agents");
    } catch (error: any) {
      // Extract detailed error message from API response
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create agent";
      
      // Show error toast that doesn't auto-dismiss
      toast.error("Failed to create agent", {
        description: errorMessage,
        duration: Infinity, // Never auto-dismiss - user must close manually
        cancel: {
          label: "Dismiss",
          onClick: () => {},
        },
      });
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // In real app, this would clear auth tokens and redirect
      toast.success("Logged out successfully");
      // navigate("/login");
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-white flex items-center justify-between px-3 sm:px-4 md:px-6 shadow-sm gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full max-w-xs sm:max-w-md">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search agents, calls, contacts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 rounded-lg bg-white border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </PopoverTrigger>
          {searchResults && (
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] p-0" align="start">
              <div className="max-h-96 overflow-y-auto">
                {searchResults.agents.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Agents</div>
                    {searchResults.agents.slice(0, 3).map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => { navigate("/voice-agents"); setIsSearchOpen(false); }}
                        className="w-full px-2 py-2 text-sm hover:bg-secondary rounded text-left"
                      >
                        {agent.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.calls.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Calls</div>
                    {searchResults.calls.slice(0, 3).map(call => (
                      <button
                        key={call.id}
                        onClick={() => { navigate("/call-history"); setIsSearchOpen(false); }}
                        className="w-full px-2 py-2 text-sm hover:bg-secondary rounded text-left"
                      >
                        {call.contact} - {call.agent}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.contacts.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Contacts</div>
                    {searchResults.contacts.slice(0, 3).map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => { navigate("/contacts"); setIsSearchOpen(false); }}
                        className="w-full px-2 py-2 text-sm hover:bg-secondary rounded text-left"
                      >
                        {contact.name} - {contact.company}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.agents.length === 0 && searchResults.calls.length === 0 && searchResults.contacts.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                )}
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 md:px-4"
          onClick={() => setIsAgentDialogOpen(true)}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">New Agent</span>
        </Button>
        
        <AgentConfigDialog
          open={isAgentDialogOpen}
          onOpenChange={setIsAgentDialogOpen}
          onSave={handleCreateAgent}
          isSaving={createAgent.isPending}
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all flex-shrink-0">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary border-2 border-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-4rem)] sm:w-80 max-w-[320px] sm:max-w-none" align="end">
            <div className="space-y-2">
              <div className="font-semibold text-sm mb-2">Notifications</div>
              <div className="text-sm p-2 hover:bg-secondary rounded cursor-pointer">
                <div className="font-medium">New call from John Smith</div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </div>
              <div className="text-sm p-2 hover:bg-secondary rounded cursor-pointer">
                <div className="font-medium">Agent 'Support Bot' is now active</div>
                <div className="text-xs text-muted-foreground">15 minutes ago</div>
              </div>
              <div className="text-sm p-2 hover:bg-secondary rounded cursor-pointer">
                <div className="font-medium">Daily summary ready</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center hover:bg-primary/30 transition-all cursor-pointer overflow-hidden flex-shrink-0">
              {(() => {
                const savedAvatar = localStorage.getItem("userAvatar");
                return savedAvatar ? (
                  <img 
                    src={savedAvatar} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-primary">ES</span>
                );
              })()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 sm:w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
