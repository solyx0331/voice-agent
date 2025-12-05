import { Bell, Search, Plus, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateAgent } from "@/hooks/useVoiceAgents";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ agents: any[]; calls: any[]; contacts: any[] } | null>(null);
  const createAgent = useCreateAgent();
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    status: "inactive" as const,
  });

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

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAgent.mutateAsync({
        ...newAgent,
        calls: 0,
        avgDuration: "0:00",
      });
      toast.success("Agent created successfully");
      setIsAgentDialogOpen(false);
      setNewAgent({ name: "", description: "", status: "inactive" });
      navigate("/voice-agents");
    } catch (error) {
      toast.error("Failed to create agent");
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
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents, calls, contacts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-white border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </PopoverTrigger>
          {searchResults && (
            <PopoverContent className="w-[400px] p-0" align="start">
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

      <div className="flex items-center gap-3">
        <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Voice Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="agent-name">Agent Name *</Label>
                <Input
                  id="agent-name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Sales Assistant"
                />
              </div>
              <div>
                <Label htmlFor="agent-description">Description *</Label>
                <Input
                  id="agent-description"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Handles inbound sales inquiries"
                />
              </div>
              <div>
                <Label htmlFor="agent-status">Initial Status</Label>
                <select
                  id="agent-status"
                  value={newAgent.status}
                  onChange={(e) => setNewAgent({ ...newAgent, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white border border-border rounded-lg"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <Button onClick={handleCreateAgent} className="w-full" disabled={createAgent.isPending}>
                {createAgent.isPending ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative h-10 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
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
            <button className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center hover:bg-primary/30 transition-all cursor-pointer overflow-hidden">
              {(() => {
                const savedAvatar = localStorage.getItem("userAvatar");
                return savedAvatar ? (
                  <img 
                    src={savedAvatar} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">ES</span>
                );
              })()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
