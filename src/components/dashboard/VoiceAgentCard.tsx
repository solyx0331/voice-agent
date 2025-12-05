import { cn } from "@/lib/utils";
import { Mic, MoreVertical, Phone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useUpdateAgent, useDeleteAgent, useAgentDetails } from "@/hooks/useVoiceAgents";
import { VoiceAgent } from "@/lib/api/types";

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
  const [editData, setEditData] = useState({ name, description, status });
  
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const { data: agentDetails, isLoading: detailsLoading } = useAgentDetails(isDetailsOpen ? id : null);

  // Sync editData when props change
  useEffect(() => {
    setEditData({ name, description, status });
  }, [name, description, status]);

  const handleEdit = async () => {
    try {
      await updateAgent.mutateAsync({
        agentId: id,
        updates: editData,
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
    <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group">
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
              setEditData({ name, description, status });
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
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Voice Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Agent Name *</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Sales Assistant"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Input
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Handles inbound sales inquiries"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as VoiceAgent["status"] })}
                  className="w-full px-4 py-2 bg-white border border-border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              <Button onClick={handleEdit} className="w-full" disabled={updateAgent.isPending || !editData.name || !editData.description}>
                {updateAgent.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
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

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className={cn("h-2 w-2 rounded-full", config.color)} />
          <span className="text-muted-foreground">{config.label}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{calls} calls</span>
          </div>
          <span>Avg: {avgDuration}</span>
        </div>
      </div>
    </div>
  );
}
