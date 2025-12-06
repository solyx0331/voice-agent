import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Phone, Mic, MicOff, PhoneOff, Pause, Play, Volume2, MessageSquare, UserPlus, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/api";
import { toast } from "sonner";
import { LiveCall } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const LiveCalls = () => {
  const queryClient = useQueryClient();
  const [selectedCall, setSelectedCall] = useState<LiveCall | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isWhisperDialogOpen, setIsWhisperDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [whisperMessage, setWhisperMessage] = useState("");
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { data: liveCalls, isLoading } = useQuery<LiveCall[]>({
    queryKey: ["live-calls"],
    queryFn: () => apiService.getLiveCalls(),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  });

  // Update call durations in real-time
  useEffect(() => {
    if (!liveCalls) return;

    liveCalls.forEach((call) => {
      if (intervalRefs.current.has(call.id)) return;

      const interval = setInterval(() => {
        queryClient.setQueryData<LiveCall[]>(["live-calls"], (old) => {
          if (!old) return old;
          return old.map((c) => {
            if (c.id === call.id) {
              return {
                ...c,
                duration: Math.floor((Date.now() - c.startTime.getTime()) / 1000),
              };
            }
            return c;
          });
        });
      }, 1000);

      intervalRefs.current.set(call.id, interval);
    });

    return () => {
      intervalRefs.current.forEach((interval) => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, [liveCalls, queryClient]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = async (callId: string, currentMuted: boolean) => {
    try {
      await apiService.toggleCallMute(callId, !currentMuted);
      queryClient.setQueryData<LiveCall[]>(["live-calls"], (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === callId ? { ...c, isMuted: !currentMuted } : c));
      });
      toast.success(currentMuted ? "Microphone unmuted" : "Microphone muted");
    } catch (error) {
      toast.error("Failed to toggle mute");
    }
  };

  const handleHold = async (callId: string, currentHold: boolean) => {
    try {
      await apiService.holdCall(callId, !currentHold);
      queryClient.setQueryData<LiveCall[]>(["live-calls"], (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === callId ? { ...c, isOnHold: !currentHold, status: !currentHold ? "on_hold" : "active" } : c));
      });
      toast.success(currentHold ? "Call resumed" : "Call put on hold");
    } catch (error) {
      toast.error("Failed to toggle hold");
    }
  };

  const handleEndCall = async (callId: string) => {
    if (!confirm("Are you sure you want to end this call?")) return;
    try {
      await apiService.endCall(callId);
      queryClient.setQueryData<LiveCall[]>(["live-calls"], (old) => {
        if (!old) return old;
        return old.filter((c) => c.id !== callId);
      });
      toast.success("Call ended");
    } catch (error) {
      toast.error("Failed to end call");
    }
  };

  const handleTransfer = async () => {
    if (!selectedCall || !transferTarget) {
      toast.error("Please select a target agent");
      return;
    }
    try {
      await apiService.transferCall(selectedCall.id, transferTarget);
      toast.success("Call transfer initiated");
      setIsTransferDialogOpen(false);
      setTransferTarget("");
    } catch (error) {
      toast.error("Failed to transfer call");
    }
  };

  const handleWhisper = async () => {
    if (!selectedCall || !whisperMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    try {
      await apiService.whisperToAgent(selectedCall.id, whisperMessage);
      toast.success("Message sent to agent");
      setIsWhisperDialogOpen(false);
      setWhisperMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleIntervene = async (callId: string) => {
    if (!confirm("Are you sure you want to intervene in this call? You will take over the conversation.")) return;
    try {
      await apiService.interveneInCall(callId);
      toast.success("Intervening in call...");
    } catch (error) {
      toast.error("Failed to intervene");
    }
  };

  const handleSentimentUpdate = async (callId: string, sentiment: "positive" | "neutral" | "negative") => {
    try {
      await apiService.updateCallSentiment(callId, sentiment);
      queryClient.setQueryData<LiveCall[]>(["live-calls"], (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === callId ? { ...c, sentiment } : c));
      });
      toast.success("Sentiment updated");
    } catch (error) {
      toast.error("Failed to update sentiment");
    }
  };

  const sentimentColors = {
    positive: "bg-emerald-500/20 text-emerald-400",
    neutral: "bg-muted text-muted-foreground",
    negative: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Live Calls</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Monitor and control active AI calls in real-time</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : liveCalls && liveCalls.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {liveCalls.map((call) => (
                <div key={call.id} className="glass-card rounded-xl p-4 sm:p-5 border-primary/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground truncate">{call.contact}</h3>
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{call.phone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {call.agent}
                        </Badge>
                        {call.type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {call.type}
                          </Badge>
                        )}
                        {call.status && call.status !== "active" && (
                          <Badge className={cn(
                            "text-xs",
                            call.status === "on_hold" && "bg-yellow-500/20 text-yellow-400",
                            call.status === "transferring" && "bg-blue-500/20 text-blue-400"
                          )}>
                            {call.status.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-primary">{formatTime(call.duration)}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>

                  {/* Real-time Transcript */}
                  {call.transcript && call.transcript.length > 0 && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Live Transcript</p>
                      <div className="space-y-1.5">
                        {call.transcript.slice(-3).map((entry, idx) => (
                          <div key={idx} className="text-xs">
                            <span className={cn(
                              "font-medium",
                              entry.speaker === "ai" ? "text-primary" : "text-muted-foreground"
                            )}>
                              {entry.speaker === "ai" ? "AI: " : "Caller: "}
                            </span>
                            <span className="text-foreground">{entry.text}</span>
                            <span className="text-muted-foreground ml-1">({entry.timestamp})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sentiment Analysis */}
                  {call.sentiment && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Sentiment:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSentimentUpdate(call.id, "positive")}
                          className={cn(
                            "p-1 rounded",
                            call.sentiment === "positive" ? sentimentColors.positive : "hover:bg-secondary"
                          )}
                          title="Mark as positive"
                        >
                          <TrendingUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleSentimentUpdate(call.id, "neutral")}
                          className={cn(
                            "p-1 rounded",
                            call.sentiment === "neutral" ? sentimentColors.neutral : "hover:bg-secondary"
                          )}
                          title="Mark as neutral"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleSentimentUpdate(call.id, "negative")}
                          className={cn(
                            "p-1 rounded",
                            call.sentiment === "negative" ? sentimentColors.negative : "hover:bg-secondary"
                          )}
                          title="Mark as negative"
                        >
                          <TrendingDown className="h-3 w-3" />
                        </button>
                      </div>
                      <Badge className={cn("text-xs", sentimentColors[call.sentiment])}>
                        {call.sentiment}
                      </Badge>
                    </div>
                  )}

                  {/* Control Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={call.isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleMute(call.id, call.isMuted || false)}
                      className="gap-1.5"
                    >
                      {call.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span className="hidden sm:inline">{call.isMuted ? "Unmute" : "Mute"}</span>
                    </Button>
                    <Button
                      variant={call.isOnHold ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHold(call.id, call.isOnHold || false)}
                      className="gap-1.5"
                    >
                      {call.isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      <span className="hidden sm:inline">{call.isOnHold ? "Resume" : "Hold"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCall(call);
                        setIsTransferDialogOpen(true);
                      }}
                      className="gap-1.5"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Transfer</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCall(call);
                        setIsWhisperDialogOpen(true);
                      }}
                      className="gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Whisper</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIntervene(call.id)}
                      className="gap-1.5 text-orange-400 hover:text-orange-500"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Intervene</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleEndCall(call.id)}
                      className="gap-1.5"
                    >
                      <PhoneOff className="h-4 w-4" />
                      <span className="hidden sm:inline">End</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center">
              <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No active calls</p>
              <p className="text-sm text-muted-foreground mt-2">All calls will appear here in real-time</p>
            </div>
          )}
        </div>
      </main>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Transfer to Agent</Label>
              <Select value={transferTarget} onValueChange={setTransferTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sales Assistant</SelectItem>
                  <SelectItem value="2">Support Bot</SelectItem>
                  <SelectItem value="3">Booking Agent</SelectItem>
                  <SelectItem value="5">Lead Qualifier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTransfer} disabled={!transferTarget}>
                Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Whisper Dialog */}
      <Dialog open={isWhisperDialogOpen} onOpenChange={setIsWhisperDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Whisper to Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Message</Label>
              <Textarea
                value={whisperMessage}
                onChange={(e) => setWhisperMessage(e.target.value)}
                placeholder="Enter a message to send to the agent (only the agent will hear this)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be heard only by the AI agent, not the caller.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsWhisperDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWhisper} disabled={!whisperMessage.trim()}>
                Send Whisper
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveCalls;

