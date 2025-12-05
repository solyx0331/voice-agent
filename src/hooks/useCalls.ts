import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { Call } from "@/lib/api/types";

export interface CallFilters {
  search?: string;
  agent?: string;
  type?: string;
  dateRange?: { start: string; end: string };
}

export function useCalls(filters?: CallFilters) {
  return useQuery<Call[]>({
    queryKey: ["calls", filters],
    queryFn: () => apiService.getCalls(filters),
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

export function useExportCalls(format: "csv" | "json" = "csv") {
  return useQuery<Blob>({
    queryKey: ["calls", "export", format],
    queryFn: () => apiService.exportCalls(format),
    enabled: false, // Only fetch when explicitly called
  });
}

