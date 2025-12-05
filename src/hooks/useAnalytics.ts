import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api/api";
import { AnalyticsData } from "@/lib/api/types";

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => apiService.getAnalyticsData(),
    refetchInterval: 60000, // Refetch every minute
  });
}

