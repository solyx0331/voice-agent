import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";

// Try to import Retell SDK, but make it optional
let RetellWebClient: any = null;
try {
  // @ts-ignore - Retell SDK may not be installed
  const retellSdk = require("retell-client-js-sdk");
  RetellWebClient = retellSdk.RetellWebClient || retellSdk.default?.RetellWebClient;
} catch (e) {
  console.log("Retell SDK not available, will use fallback WebRTC");
}

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
  const websocketRef = useRef<WebSocket | null>(null);
  const retellClientRef = useRef<any>(null);

  // Cleanup on unmount or when dialog closes
  useEffect(() => {
    if (!open) {
      // Dialog closed - cleanup everything
      cleanup();
      setIsConnected(false);
      setIsConnecting(false);
      setCallId(null);
      setError(null);
      setIsMuted(false);
      setIsSpeakerMuted(false);
    }
    
    return () => {
      // Cleanup on unmount
      if (!open) {
        cleanup();
      }
    };
  }, [open]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    if (peerConnectionRef.current) {
      // Handle RTCPeerConnection
      if (peerConnectionRef.current.close) {
        peerConnectionRef.current.close();
      }
      peerConnectionRef.current = null;
    }
    if (retellClientRef.current) {
      // Handle Retell SDK client
      if (retellClientRef.current.stopCall) {
        retellClientRef.current.stopCall();
      }
      retellClientRef.current = null;
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
      
      console.log("Web call test response:", response);
      
      if (!response || !response.callId || !response.token) {
        console.error("Invalid response:", response);
        throw new Error(`Failed to get call credentials from server. Response: ${JSON.stringify(response)}`);
      }

      setCallId(response.callId);

      // Use Retell Web SDK if available, otherwise fall back to manual WebRTC
      try {
        if (RetellWebClient) {
          // Use Retell Web SDK (official SDK)
          const retellClient = new RetellWebClient();

          // Set up event handlers before starting call
          retellClient.on("call_started", () => {
            console.log("Retell SDK: Call started");
            setIsConnecting(false);
            setIsConnected(true);
            toast.success("Connected to agent");
          });

          retellClient.on("call_ended", () => {
            console.log("Retell SDK: Call ended");
            // Delay cleanup to show the call ended state
            setTimeout(() => {
              handleEndCall();
            }, 1000);
          });

          retellClient.on("error", (error: any) => {
            console.error("Retell SDK error:", error);
            setError(error.message || "Connection error");
            // Don't immediately disconnect on error
            setTimeout(() => {
              handleEndCall();
            }, 2000);
          });

          // Store client for cleanup
          retellClientRef.current = retellClient;

          // Start the call
          console.log("Starting Retell web call with token:", response.token.substring(0, 20) + "...");
          await retellClient.startCall({
            accessToken: response.token,
            sampleRate: 24000,
          });
          
          console.log("Retell call started successfully");
        } else {
          // SDK not available, use manual WebRTC
          throw new Error("Retell SDK not available");
        }
      } catch (sdkError: any) {
        console.error("Retell SDK error or not available:", sdkError);
        // If SDK fails or is not available, fall back to manual WebRTC
        console.log("Falling back to manual WebRTC implementation");
        
        // Fallback: Manual WebRTC implementation
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
        const ws = new WebSocket(`wss://api.retellai.com/websocket/${response.callId}?token=${response.token}`);
        websocketRef.current = ws;
        
          ws.onopen = () => {
            console.log("WebSocket connected successfully");
            setIsConnecting(false);
            setIsConnected(true);
            toast.success("Connected to agent");
            // Keep connection alive - don't auto-disconnect
          };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);
            
            if (message.type === "offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(message));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
            } else if (message.type === "ice-candidate") {
              await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            } else if (message.type === "call_ended" || message.event === "call_ended") {
              console.log("Call ended by server");
              // Don't immediately disconnect - let user see the call ended
              setTimeout(() => {
                handleEndCall();
              }, 1000);
            }
          } catch (error: any) {
            console.error("Error processing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Connection error. Please try again.");
          // Don't immediately disconnect on error, let user see the error
          setTimeout(() => {
            handleEndCall();
          }, 2000);
        };

        ws.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason, "wasClean:", event.wasClean, "Current isConnected:", isConnected);
          // Clear WebSocket ref
          websocketRef.current = null;
          
          // Capture connection state at time of close
          const wasConnectedAtClose = isConnected;
          
          // Only handle disconnection if we were actually connected
          if (wasConnectedAtClose) {
            // If it's an abnormal closure, show error and disconnect
            if (!event.wasClean || event.code !== 1000) {
              console.log("Abnormal WebSocket closure, will disconnect after delay");
              setError(`Connection closed: ${event.reason || `Code ${event.code}`}`);
              // Delay disconnect to allow user to see the error
              setTimeout(() => {
                // Only disconnect if still connected
                if (isConnected) {
                  console.log("Disconnecting due to WebSocket close");
                  handleEndCall();
                }
              }, 3000);
            } else {
              // Normal close (code 1000) - might be intentional, don't auto-disconnect
              console.log("Normal WebSocket close, keeping UI visible");
            }
          } else {
            // Wasn't connected - clean up silently
            console.log("WebSocket closed but wasn't connected, cleaning up");
            handleEndCall();
          }
        };

        // Handle peer connection state changes
        pc.onconnectionstatechange = () => {
          console.log("Peer connection state:", pc.connectionState);
          if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
            console.log("Peer connection failed or disconnected");
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
          if (pc.iceConnectionState === "failed") {
            console.log("ICE connection failed");
            setError("Connection failed. Please check your network.");
          }
        };
      }

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
    console.log("handleEndCall called. Current state - isConnected:", isConnected);
    
    // Cleanup resources
    cleanup();
    
    // Only show toast if we were actually connected
    if (isConnected) {
      toast.info("Call ended");
    }
    
    // Reset state
    setIsConnected(false);
    setIsConnecting(false);
    setCallId(null);
    setError(null);
    setIsMuted(false);
    setIsSpeakerMuted(false);
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

  // Cleanup on dialog close
  useEffect(() => {
    if (!open) {
      // Only cleanup if dialog is closed
      cleanup();
      setIsConnected(false);
      setIsConnecting(false);
      setCallId(null);
      setError(null);
      setIsMuted(false);
      setIsSpeakerMuted(false);
    }
  }, [open]);

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

