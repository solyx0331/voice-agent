import { Phone, Mic, Volume2, MicOff, ExternalLink } from "lucide-react";
import { useLiveCall } from "@/hooks/useDashboard";
import { useState } from "react";
import { apiService } from "@/lib/api/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LiveCallWidget() {
  const { data: liveCall, isLoading } = useLiveCall();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = async () => {
    if (!liveCall) return;
    try {
      await apiService.toggleCallMute(liveCall.id, !isMuted);
      setIsMuted(!isMuted);
      toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
    } catch (error) {
      toast.error("Failed to toggle mute");
    }
  };

  const handleEndCall = async () => {
    if (!liveCall) return;
    if (confirm("Are you sure you want to end this call?")) {
      try {
        await apiService.endCall(liveCall.id);
        queryClient.invalidateQueries({ queryKey: ["live-call"] });
        toast.success("Call ended");
      } catch (error) {
        toast.error("Failed to end call");
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5 border-primary/30">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-1/2" />
          <div className="h-20 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!liveCall) {
    return (
      <div className="glass-card rounded-xl p-5 border-border">
        <div className="text-center py-8">
          <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No active calls</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 border-primary/30">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Live Call</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs sm:text-sm text-primary font-medium">Active</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/live-calls")}
            className="h-7 px-2 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View All
          </Button>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm sm:text-base truncate">{liveCall.contact}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{liveCall.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
          <span className="text-muted-foreground truncate">Agent: {liveCall.agent}</span>
          <span className="text-primary font-mono">{formatTime(liveCall.duration)}</span>
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 h-10 sm:h-12 mb-3 sm:mb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 sm:w-1 bg-primary rounded-full"
            style={{
              height: `${Math.random() * 100}%`,
              animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={handleMute}
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
            isMuted
              ? "bg-destructive/20 border-destructive text-destructive"
              : "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/50"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>
        <button
          onClick={handleEndCall}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-all flex-shrink-0"
          title="End Call"
        >
          <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="relative group">
          <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex-shrink-0">
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                orient="vertical"
                style={{ writingMode: "vertical-lr" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
