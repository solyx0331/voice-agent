import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { LiveCall } from "@/lib/api/types";

interface UseLiveCallSocketOptions {
  enabled?: boolean;
}

export function useLiveCallSocket(options: UseLiveCallSocketOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [liveCall, setLiveCall] = useState<LiveCall | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleCallStarted = (data: any) => {
      console.log("WebSocket: call:started", data);
      
      // Transform to LiveCall format
      const call: LiveCall = {
        id: data.callId,
        contact: data.contact || "Unknown",
        phone: data.phone || "",
        agent: "", // Will be updated from agent lookup
        agentId: data.agentId,
        duration: 0,
        startTime: new Date(data.startTime || Date.now()),
        type: data.type || "inbound",
        status: "active",
      };

      setLiveCall(call);
      queryClient.setQueryData<LiveCall | null>(["live-call"], call);
    };

    const handleCallEnded = (data: any) => {
      console.log("WebSocket: call:ended", data);
      
      // Clear live call when it ends
      setLiveCall(null);
      queryClient.setQueryData<LiveCall | null>(["live-call"], null);
      
      // Invalidate calls list to refresh
      queryClient.invalidateQueries({ queryKey: ["live-calls"] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    };

    const handleCallTranscript = (data: { callId: string; transcript: any[] }) => {
      console.log("WebSocket: call:transcript", data);
      
      // Update transcript in live call
      setLiveCall((prev) => {
        if (prev && prev.id === data.callId) {
          return {
            ...prev,
            transcript: data.transcript,
          };
        }
        return prev;
      });

      queryClient.setQueryData<LiveCall | null>(["live-call"], (old) => {
        if (old && old.id === data.callId) {
          return {
            ...old,
            transcript: data.transcript,
          };
        }
        return old;
      });
    };

    const handleCallStateChanged = (data: { callId: string; state: any }) => {
      console.log("WebSocket: call:state-changed", data);
      
      setLiveCall((prev) => {
        if (prev && prev.id === data.callId) {
          return {
            ...prev,
            ...data.state,
          };
        }
        return prev;
      });

      queryClient.setQueryData<LiveCall | null>(["live-call"], (old) => {
        if (old && old.id === data.callId) {
          return {
            ...old,
            ...data.state,
          };
        }
        return old;
      });
    };

    const handleCallUpdated = (data: { callId: string; updates: any }) => {
      console.log("WebSocket: call:updated", data);
      
      setLiveCall((prev) => {
        if (prev && prev.id === data.callId) {
          return {
            ...prev,
            ...data.updates,
          };
        }
        return prev;
      });

      queryClient.setQueryData<LiveCall | null>(["live-call"], (old) => {
        if (old && old.id === data.callId) {
          return {
            ...old,
            ...data.updates,
          };
        }
        return old;
      });
    };

    // Set initial connection state
    setIsConnected(socket.connected);

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("call:started", handleCallStarted);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:transcript", handleCallTranscript);
    socket.on("call:state-changed", handleCallStateChanged);
    socket.on("call:updated", handleCallUpdated);

    // Update duration every second for active calls
    const durationInterval = setInterval(() => {
      setLiveCall((prev) => {
        if (prev && prev.startTime) {
          const duration = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
          return {
            ...prev,
            duration,
          };
        }
        return prev;
      });

      queryClient.setQueryData<LiveCall | null>(["live-call"], (old) => {
        if (old && old.startTime) {
          const duration = Math.floor((Date.now() - old.startTime.getTime()) / 1000);
          return {
            ...old,
            duration,
          };
        }
        return old;
      });
    }, 1000);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("call:started", handleCallStarted);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:transcript", handleCallTranscript);
      socket.off("call:state-changed", handleCallStateChanged);
      socket.off("call:updated", handleCallUpdated);
      clearInterval(durationInterval);
    };
  }, [enabled, queryClient]);

  return {
    liveCall,
    isConnected,
  };
}

