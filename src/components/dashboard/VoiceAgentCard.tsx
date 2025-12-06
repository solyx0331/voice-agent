import { cn } from "@/lib/utils";
import { Mic, MoreVertical, Phone, Clock, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useUpdateAgent, useDeleteAgent, useAgentDetails } from "@/hooks/useVoiceAgents";
import { VoiceAgent, Call } from "@/lib/api/types";
import { AgentConfigDialog } from "@/components/dashboard/AgentConfigDialog";
import { apiService } from "@/lib/api/api";

interface VoiceAgentCardProps {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "busy";
  calls: number;
  avgDuration: string;
}

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500", ring: "ring-emerald-500/30" },
  inactive: { label: "Inactive", color: "bg-muted-foreground", ring: "ring-muted-foreground/30" },
  busy: { label: "On Call", color: "bg-primary", ring: "ring-primary/30" },
};

export function VoiceAgentCard({ id, name, description, status, calls, avgDuration }: VoiceAgentCardProps) {
  const config = statusConfig[status];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const { data: agentDetails, isLoading: detailsLoading } = useAgentDetails(isDetailsOpen ? id : null);

  // Load recent calls for this agent
  useEffect(() => {
    const loadRecentCalls = async () => {
      setIsLoadingCalls(true);
      try {
        const calls = await apiService.getAgentCalls(id, 5);
        setRecentCalls(calls);
      } catch (error) {
        console.error("Failed to load recent calls", error);
      } finally {
        setIsLoadingCalls(false);
      }
    };
    loadRecentCalls();
  }, [id]);

  const handleEdit = async (agentData: Partial<VoiceAgent>) => {
    try {
      await updateAgent.mutateAsync({
        agentId: id,
        updates: agentData,
      });
      toast.success("Agent updated successfully");
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update agent");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent.mutateAsync(id);
      toast.success("Agent deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete agent");
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 group h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            {status === "busy" && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary animate-pulse-ring" />
            )}
            <span className={cn(
              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card",
              config.color
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              setIsEditOpen(true);
            }}>
              Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              setIsDetailsOpen(true);
            }}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
                setIsDeleteOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Agent Dialog */}
        <AgentConfigDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          agent={agentDetails || undefined}
          onSave={handleEdit}
          isSaving={updateAgent.isPending}
        />

        {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agent Details: {name}</DialogTitle>
            </DialogHeader>
            {detailsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading details...</div>
            ) : agentDetails ? (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">{agentDetails.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <p className="font-medium capitalize">{agentDetails.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <p className="font-medium">{agentDetails.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Total Calls</Label>
                    <p className="font-medium">{agentDetails.totalCalls}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Average Duration</Label>
                    <p className="font-medium">{agentDetails.avgDuration}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Success Rate</Label>
                    <p className="font-medium">{agentDetails.successRate}%</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created At</Label>
                    <p className="font-medium">{agentDetails.createdAt}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Active</Label>
                    <p className="font-medium">{agentDetails.lastActive}</p>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
                  </div>
                  {isLoadingCalls ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading recent calls...</div>
                  ) : recentCalls.length > 0 ? (
                    <div className="space-y-3">
                      {recentCalls.map((call) => (
                        <div key={call.id} className="p-3 bg-secondary rounded-lg">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{call.contact}</p>
                              <p className="text-sm text-muted-foreground">{call.phone}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{call.date}</span>
                                <span>•</span>
                                <span>{call.time}</span>
                                <span>•</span>
                                <span>{call.duration}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {call.outcome && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-xs px-2 py-1",
                                    call.outcome === "success" && "bg-emerald-500/20 text-emerald-400",
                                    call.outcome === "caller_hung_up" && "bg-yellow-500/20 text-yellow-400",
                                    call.outcome === "speech_not_recognized" && "bg-red-500/20 text-red-400"
                                  )}
                                >
                                  {call.outcome.replace(/_/g, " ")}
                                </Badge>
                              )}
                              {call.latency && (
                                <div className="text-xs text-muted-foreground">
                                  <span>Avg: {call.latency.avg}ms</span>
                                  {call.latency.peak && (
                                    <span className="ml-2">Peak: {call.latency.peak}ms</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {call.transcript && call.transcript.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Transcript Preview</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {call.transcript.slice(0, 2).map((entry, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className={cn(
                                      "font-medium",
                                      entry.speaker === "ai" ? "text-primary" : "text-muted-foreground"
                                    )}>
                                      {entry.speaker === "ai" ? "AI: " : "Caller: "}
                                    </span>
                                    <span className="text-foreground">{entry.text}</span>
                                  </div>
                                ))}
                                {call.transcript.length > 2 && (
                                  <p className="text-xs text-muted-foreground italic">
                                    +{call.transcript.length - 2} more exchanges
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4 text-center">No recent calls</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Failed to load details</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Agent</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{name}"? This action cannot be undone and will permanently remove the agent and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteAgent.isPending}
              >
                {deleteAgent.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className={cn("h-2 w-2 rounded-full", config.color)} />
          <span className="text-muted-foreground">{config.label}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{calls} calls</span>
          </div>
          <span>Avg: {avgDuration}</span>
        </div>
      </div>
    </div>
  );
}
