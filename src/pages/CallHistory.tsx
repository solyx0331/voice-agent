import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Download, Filter, Calendar, X, Play, Pause, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalls } from "@/hooks/useCalls";
import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Call } from "@/lib/api/types";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [isAgentFilterOpen, setIsAgentFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
    setIsDetailModalOpen(true);
    if (call.recording && playingRecordingId !== call.id) {
      setPlayingRecordingId(null);
      setRecordingUrl(null);
    }
  };

  const handlePlayRecording = async (callId: string, call?: Call) => {
    try {
      // If already playing this recording, pause it
      if (playingRecordingId === callId && audioRef.current) {
        audioRef.current.pause();
        setPlayingRecordingId(null);
        setRecordingUrl(null);
        return;
      }

      // Stop any currently playing recording
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      let recordingUrlToUse: string | null = null;

      // Priority 1: Use recordingUrl from call object if available
      if (call?.recordingUrl) {
        recordingUrlToUse = call.recordingUrl;
      } else {
        // Priority 2: Fetch from API
        try {
          recordingUrlToUse = await apiService.playRecording(callId);
        } catch (apiError: any) {
          // If API call fails, check if call has recordingUrl in the calls list
          const callFromList = calls?.find(c => c.id === callId);
          if (callFromList?.recordingUrl) {
            recordingUrlToUse = callFromList.recordingUrl;
          } else {
            throw apiError;
          }
        }
      }

      if (!recordingUrlToUse) {
        toast.error("No recording URL available for this call");
        return;
      }

      setRecordingUrl(recordingUrlToUse);
      setPlayingRecordingId(callId);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = recordingUrlToUse;
        audioRef.current.load(); // Load the audio source
        
        // Try to play with better error handling
        try {
          await audioRef.current.play();
        } catch (playError: any) {
          console.error("Audio play error:", playError);
          
          // Check if it's a CORS or network error
          if (playError.name === "NotAllowedError") {
            toast.error("Browser blocked audio playback. Please interact with the page first.");
          } else if (playError.name === "NotSupportedError") {
            toast.error("Audio format not supported by your browser");
          } else if (playError.message?.includes("Failed to load")) {
            toast.error("Failed to load recording. The recording URL may be invalid or expired.");
          } else {
            toast.error(`Failed to play recording: ${playError.message || "Unknown error"}`);
          }
          
          setPlayingRecordingId(null);
          setRecordingUrl(null);
        }
      }
    } catch (error: any) {
      console.error("Recording playback error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load recording";
      toast.error(errorMessage);
      setPlayingRecordingId(null);
      setRecordingUrl(null);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlayingRecordingId(null);
      setRecordingUrl(null);
    };

    const handleError = (e: Event) => {
      console.error("Audio element error:", e);
      const audio = e.target as HTMLAudioElement;
      let errorMessage = "Error playing recording";
      
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio playback was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error while loading recording";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Error decoding recording";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Recording format not supported";
            break;
          default:
            errorMessage = `Audio error: ${audio.error.message || "Unknown error"}`;
        }
      }
      
      toast.error(errorMessage);
      setPlayingRecordingId(null);
      setRecordingUrl(null);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Call History</h1>
              <p className="text-sm sm:text-base text-muted-foreground">View and manage all call records</p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
            <Popover open={isAgentFilterOpen} onOpenChange={setIsAgentFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={selectedAgent ? "default" : "outline"} 
                  size="sm"
                  className="relative h-9 sm:h-10 px-2.5 sm:px-3 text-xs sm:text-sm flex-shrink-0"
                >
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Filter by Agent</span>
                  <span className="sm:hidden">Agent</span>
                  {selectedAgent && (
                    <Badge className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">
                      1
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-5rem)] sm:w-64 max-w-[calc(100vw-5rem)] sm:max-w-none" align="start" sideOffset={4}>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm">Filter by Agent</h3>
                    {selectedAgent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(undefined);
                          setIsAgentFilterOpen(false);
                        }}
                        className="h-6 px-2 text-xs flex-shrink-0"
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
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  className="relative h-9 sm:h-10 px-2.5 sm:px-3 text-xs sm:text-sm flex-shrink-0"
                >
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Call Type</span>
                  <span className="sm:hidden">Type</span>
                  {selectedType && (
                    <Badge className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">
                      1
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-5rem)] sm:w-64 max-w-[calc(100vw-5rem)] sm:max-w-none" align="start" sideOffset={4}>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm">Filter by Call Type</h3>
                    {selectedType && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedType(undefined);
                          setIsTypeFilterOpen(false);
                        }}
                        className="h-6 px-2 text-xs flex-shrink-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <button
                      onClick={() => {
                        setSelectedType(undefined);
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors",
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
                        "w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2",
                        selectedType === "inbound"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneIncoming className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0", selectedType === "inbound" ? "text-emerald-400" : "text-emerald-400")} />
                      Inbound
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType("outbound");
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2",
                        selectedType === "outbound"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneOutgoing className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0", selectedType === "outbound" ? "text-primary" : "text-primary")} />
                      Outbound
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType("missed");
                        setIsTypeFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-2",
                        selectedType === "missed"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      <PhoneMissed className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0", selectedType === "missed" ? "text-red-400" : "text-red-400")} />
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
          </div>

          {/* Calls Table - Responsive */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3">Contact</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden lg:table-cell">Agent</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden sm:table-cell">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden xl:table-cell">Duration</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden md:table-cell">Date & Time</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden sm:table-cell">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-4 lg:px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : calls && calls.length > 0 ? (
                    calls.map((call) => {
                      const Icon = typeIcons[call.type];
                      const isPlaying = playingRecordingId === call.id;
                      return (
                        <tr 
                          key={call.id} 
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => handleViewDetails(call)}
                        >
                          <td className="px-3 sm:px-4 lg:px-5 py-4">
                            <div>
                              <span className="font-medium text-foreground">{call.contact}</span>
                              <p className="text-sm text-muted-foreground">{call.phone}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4 text-muted-foreground hidden lg:table-cell">{call.agent}</td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-4 w-4", typeColors[call.type])} />
                              <span className="capitalize text-muted-foreground">{call.type}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4 text-muted-foreground hidden xl:table-cell">{call.duration}</td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4 hidden md:table-cell">
                            <div>
                              <span className="text-foreground">{call.date}</span>
                              <p className="text-sm text-muted-foreground">{call.time}</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4 hidden sm:table-cell">
                            <div className="flex flex-col gap-1">
                              <span className={cn("px-2 py-1 rounded-full text-xs font-medium w-fit", statusBadge[call.status])}>
                                {call.status}
                              </span>
                              {call.outcome && (
                                <Badge 
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 w-fit",
                                    call.outcome === "success" && "bg-emerald-500/20 text-emerald-400",
                                    call.outcome === "caller_hung_up" && "bg-yellow-500/20 text-yellow-400",
                                    call.outcome === "speech_not_recognized" && "bg-red-500/20 text-red-400"
                                  )}
                                >
                                  {call.outcome.replace(/_/g, " ")}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {call.recording && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary/80 p-2"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering row click
                                    handlePlayRecording(call.id, call);
                                  }}
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(call);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
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

          {/* Call Detail Modal */}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedCall && (
                <>
                  <DialogHeader>
                    <DialogTitle>Call Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Contact</Label>
                        <p className="font-medium text-foreground">{selectedCall.contact}</p>
                        <p className="text-sm text-muted-foreground">{selectedCall.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Agent</Label>
                        <p className="font-medium text-foreground">{selectedCall.agent}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Call Type</Label>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = typeIcons[selectedCall.type];
                            return <Icon className={cn("h-4 w-4", typeColors[selectedCall.type])} />;
                          })()}
                          <span className="capitalize font-medium text-foreground">{selectedCall.type}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Duration</Label>
                        <p className="font-medium text-foreground">{selectedCall.duration}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Date</Label>
                        <p className="font-medium text-foreground">{selectedCall.date}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Time</Label>
                        <p className="font-medium text-foreground">{selectedCall.time}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <span className={cn("ml-2 px-2 py-1 rounded-full text-xs font-medium inline-block", statusBadge[selectedCall.status])}>
                          {selectedCall.status}
                        </span>
                      </div>
                      {selectedCall.outcome && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Outcome</Label>
                          <Badge 
                            className={cn(
                              "mt-1",
                              selectedCall.outcome === "success" && "bg-emerald-500/20 text-emerald-400",
                              selectedCall.outcome === "caller_hung_up" && "bg-yellow-500/20 text-yellow-400",
                              selectedCall.outcome === "speech_not_recognized" && "bg-red-500/20 text-red-400",
                              selectedCall.outcome === "other" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {selectedCall.outcome.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      )}
                      {selectedCall.latency && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Latency</Label>
                          <p className="font-medium text-foreground">
                            Avg: {selectedCall.latency.avg}ms
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Peak: {selectedCall.latency.peak}ms
                          </p>
                        </div>
                      )}
                      {selectedCall.disconnectionReason && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Disconnection Reason</Label>
                          <p className="font-medium text-foreground capitalize">
                            {selectedCall.disconnectionReason.replace(/_/g, " ")}
                          </p>
                        </div>
                      )}
                      {selectedCall.callCost && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Call Cost</Label>
                          <p className="font-medium text-foreground">
                            {selectedCall.callCost.currency || "USD"} {selectedCall.callCost.total?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      )}
                      {selectedCall.startTime && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Start Time</Label>
                          <p className="font-medium text-foreground">
                            {new Date(selectedCall.startTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedCall.endTime && (
                        <div>
                          <Label className="text-sm text-muted-foreground">End Time</Label>
                          <p className="font-medium text-foreground">
                            {new Date(selectedCall.endTime).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Call Analysis Section */}
                    {selectedCall.callAnalysis && (
                      <div className="pt-4 border-t border-border space-y-4">
                        <Label className="text-sm font-medium mb-3 block">Call Analysis</Label>
                        
                        {selectedCall.callAnalysis.sentiment && (
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Sentiment</Label>
                            <Badge 
                              className={cn(
                                "capitalize",
                                selectedCall.callAnalysis.sentiment === "positive" && "bg-emerald-500/20 text-emerald-400",
                                selectedCall.callAnalysis.sentiment === "negative" && "bg-red-500/20 text-red-400",
                                selectedCall.callAnalysis.sentiment === "neutral" && "bg-blue-500/20 text-blue-400",
                                selectedCall.callAnalysis.sentiment === "unknown" && "bg-muted text-muted-foreground"
                              )}
                            >
                              {selectedCall.callAnalysis.sentiment}
                            </Badge>
                          </div>
                        )}

                        {selectedCall.callAnalysis.summary && (
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Summary</Label>
                            <p className="text-sm text-foreground bg-secondary p-3 rounded-lg">
                              {selectedCall.callAnalysis.summary}
                            </p>
                          </div>
                        )}

                        {selectedCall.callAnalysis.extractedData && 
                         Object.keys(selectedCall.callAnalysis.extractedData).length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Extracted Data</Label>
                            <div className="bg-secondary p-3 rounded-lg space-y-2">
                              {Object.entries(selectedCall.callAnalysis.extractedData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-xs font-medium text-muted-foreground capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span className="text-xs text-foreground">
                                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedCall.transcript && selectedCall.transcript.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <Label className="text-sm font-medium mb-3 block">Transcript</Label>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedCall.transcript.map((entry, index) => (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg",
                                entry.speaker === "ai" 
                                  ? "bg-primary/10 border border-primary/20" 
                                  : "bg-secondary"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                  "text-xs font-medium",
                                  entry.speaker === "ai" ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {entry.speaker === "ai" ? "AI Agent" : "Caller"}
                                </span>
                                <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                              </div>
                              <p className="text-sm text-foreground">{entry.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCall.recording && (
                      <div className="pt-4 border-t border-border">
                        <Label className="text-sm font-medium mb-3 block">Recording</Label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePlayRecording(selectedCall.id, selectedCall)}
                              className="gap-2"
                            >
                              {playingRecordingId === selectedCall.id ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  Play Recording
                                </>
                              )}
                            </Button>
                            {playingRecordingId === selectedCall.id && recordingUrl && (
                              <span className="text-sm text-muted-foreground">Playing...</span>
                            )}
                          </div>
                          {recordingUrl && playingRecordingId === selectedCall.id && (
                            <audio
                              controls
                              className="w-full"
                              autoPlay
                              key={recordingUrl}
                              onPlay={() => setPlayingRecordingId(selectedCall.id)}
                              onPause={() => {
                                if (playingRecordingId === selectedCall.id) {
                                  setPlayingRecordingId(null);
                                }
                              }}
                              onEnded={() => {
                                setPlayingRecordingId(null);
                                setRecordingUrl(null);
                              }}
                            >
                              <source src={recordingUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Hidden audio element for table row playback */}
          <audio 
            ref={audioRef} 
            style={{ display: 'none' }}
            onEnded={() => {
              setPlayingRecordingId(null);
              setRecordingUrl(null);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default CallHistory;
