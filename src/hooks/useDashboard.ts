import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { DashboardStats, VoiceAgent, LiveCall } from "@/lib/api/types";
import { useEffect } from "react";
import { useLiveCallSocket } from "./useLiveCallSocket";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds (HTTP polling for stats)
  });
}

export function useVoiceAgents() {
  return useQuery<VoiceAgent[]>({
    queryKey: ["voice-agents"],
    queryFn: () => apiService.getVoiceAgents(),
    refetchInterval: 20000, // Refetch every 20 seconds (HTTP polling)
  });
}

/**
 * Hybrid approach: WebSocket for real-time updates + HTTP fallback
 * - Uses WebSocket for instant updates (call started, ended, transcript)
 * - Falls back to HTTP polling if WebSocket is not connected
 */
export function useLiveCall() {
  const queryClient = useQueryClient();
  
  // Use WebSocket for real-time updates
  const { liveCall: socketLiveCall, isConnected } = useLiveCallSocket({ enabled: true });
  
  // HTTP fallback query (only used if WebSocket is not connected or for initial load)
  const httpQuery = useQuery<LiveCall | null>({
    queryKey: ["live-call"],
    queryFn: () => apiService.getLiveCall(),
    refetchInterval: isConnected ? false : 5000, // Only poll if WebSocket is disconnected
    enabled: !isConnected || !socketLiveCall, // Only fetch if WebSocket not connected or no data
  });

  // Sync WebSocket data to React Query cache
  useEffect(() => {
    if (socketLiveCall && isConnected) {
      queryClient.setQueryData<LiveCall | null>(["live-call"], socketLiveCall);
    }
  }, [socketLiveCall, isConnected, queryClient]);

  // Return WebSocket data if available, otherwise HTTP data
  const liveCall = isConnected && socketLiveCall ? socketLiveCall : httpQuery.data;

  return {
    ...httpQuery,
    data: liveCall,
    isConnected,
  };
}

