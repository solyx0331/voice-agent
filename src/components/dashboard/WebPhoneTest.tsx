import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";

interface WebPhoneTestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
}

export function WebPhoneTest({ open, onOpenChange, agentId, agentName }: WebPhoneTestProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleStartCall = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      // Create web call via backend
      const response = await apiService.createWebCallTest(agentId);
      
      if (!response.callId || !response.token) {
        throw new Error("Failed to get call credentials from server");
      }

      setCallId(response.callId);

      // Initialize Retell Web SDK for WebRTC connection
      // Note: You'll need to install @retellai/retell-sdk or use Retell's web call API
      // For now, we'll create a basic WebRTC connection
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });

      // Add local audio tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote audio
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.volume = isSpeakerMuted ? 0 : 1;
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        audioContextRef.current = new AudioContext();
      };

      peerConnectionRef.current = pc;

      // Connect to Retell using WebSocket
      // Retell web calls use WebSocket for signaling
      const ws = new WebSocket(`wss://api.retellai.com/websocket/${response.callId}?token=${response.token}`);
      
      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        toast.success("Connected to agent");
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
        } else if (message.type === "ice-candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error. Please try again.");
        handleEndCall();
      };

      ws.onclose = () => {
        handleEndCall();
      };

    } catch (error: any) {
      console.error("Failed to start call:", error);
      setError(error.message || "Failed to start call. Please check your microphone permissions.");
      toast.error("Failed to start call", {
        description: error.message || "Please allow microphone access and try again.",
      });
      setIsConnecting(false);
      cleanup();
    }
  };

  const handleEndCall = () => {
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
    setCallId(null);
    setError(null);
    setIsMuted(false);
    setIsSpeakerMuted(false);
    
    if (isConnected) {
      toast.info("Call ended");
    }
  };

  const handleToggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    // Adjust audio volume
    if (audioContextRef.current) {
      // Volume is handled by the Audio element
    }
  };

  // Close dialog when call ends
  useEffect(() => {
    if (!isConnected && !isConnecting && !error) {
      // Dialog will stay open, user can start a new call
    }
  }, [isConnected, isConnecting, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Agent: {agentName}</DialogTitle>
          <DialogDescription>
            Test your agent's responses using your browser's microphone. Make sure to allow microphone access when prompted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Status indicator */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isConnected 
                ? "bg-green-500/20 ring-4 ring-green-500/30 animate-pulse" 
                : isConnecting
                ? "bg-yellow-500/20 ring-4 ring-yellow-500/30"
                : "bg-muted"
            }`}>
              {isConnected ? (
                <Phone className="h-12 w-12 text-green-500" />
              ) : isConnecting ? (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
              ) : (
                <PhoneOff className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            {isConnected && (
              <p className="text-lg font-semibold text-green-500">Connected</p>
            )}
            {isConnecting && (
              <p className="text-lg font-semibold text-yellow-500">Connecting...</p>
            )}
            {!isConnected && !isConnecting && (
              <p className="text-lg font-semibold text-muted-foreground">Ready to test</p>
            )}
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!isConnected && !isConnecting && (
              <Button
                onClick={handleStartCall}
                size="lg"
                className="rounded-full h-16 w-16"
              >
                <Phone className="h-6 w-6" />
              </Button>
            )}

            {isConnected && (
              <>
                <Button
                  onClick={handleToggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  className="rounded-full h-16 w-16"
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={handleToggleSpeaker}
                  variant={isSpeakerMuted ? "outline" : "default"}
                  size="lg"
                  className="rounded-full h-16 w-16"
                >
                  {isSpeakerMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="rounded-full h-16 w-16"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {isConnecting && (
            <p className="text-sm text-muted-foreground text-center">
              Please allow microphone access when prompted
            </p>
          )}

          {isConnected && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Call ID: <span className="font-mono text-xs">{callId}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Speak naturally to test your agent's responses
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

