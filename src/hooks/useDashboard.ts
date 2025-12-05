import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { DashboardStats, VoiceAgent, LiveCall } from "@/lib/api/types";
import { useEffect } from "react";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useVoiceAgents() {
  return useQuery<VoiceAgent[]>({
    queryKey: ["voice-agents"],
    queryFn: () => apiService.getVoiceAgents(),
    refetchInterval: 20000, // Refetch every 20 seconds
  });
}

export function useLiveCall() {
  const queryClient = useQueryClient();
  
  const query = useQuery<LiveCall | null>({
    queryKey: ["live-call"],
    queryFn: () => apiService.getLiveCall(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Simulate call duration updates
  useEffect(() => {
    if (!query.data) return;

    const interval = setInterval(() => {
      queryClient.setQueryData<LiveCall | null>(["live-call"], (old) => {
        if (!old) return null;
        return {
          ...old,
          duration: Math.floor((Date.now() - old.startTime.getTime()) / 1000),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [query.data, queryClient]);

  return query;
}

