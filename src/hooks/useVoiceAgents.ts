import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { VoiceAgent } from "@/lib/api/types";

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent: Omit<VoiceAgent, "id">) => apiService.createAgent(agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-agents"] });
    },
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, status }: { agentId: string; status: VoiceAgent["status"] }) =>
      apiService.updateAgentStatus(agentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-agents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, updates }: { agentId: string; updates: Partial<Omit<VoiceAgent, "id">> }) =>
      apiService.updateAgent(agentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-agents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => apiService.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-agents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useAgentDetails(agentId: string | null) {
  return useQuery({
    queryKey: ["agent-details", agentId],
    queryFn: () => apiService.getAgentDetails(agentId!),
    enabled: !!agentId,
  });
}

