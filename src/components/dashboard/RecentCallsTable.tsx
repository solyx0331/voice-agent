import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalls } from "@/hooks/useCalls";
import { Skeleton } from "@/components/ui/skeleton";

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

export function RecentCallsTable() {
  const { data: calls, isLoading } = useCalls();

  const recentCalls = calls?.slice(0, 5) || [];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Recent Calls</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3">Contact</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden sm:table-cell">Agent</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden md:table-cell">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3 hidden lg:table-cell">Duration</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 lg:px-5 py-3">Time</th>
            </tr>
          </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4"><Skeleton className="h-4 w-20 sm:w-24" /></td>
                        <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 hidden sm:table-cell"><Skeleton className="h-4 w-16 sm:w-20" /></td>
                        <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 hidden md:table-cell"><Skeleton className="h-4 w-12 sm:w-16" /></td>
                        <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 hidden lg:table-cell"><Skeleton className="h-4 w-10 sm:w-12" /></td>
                        <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4"><Skeleton className="h-4 w-12 sm:w-16" /></td>
                      </tr>
                    ))
                  ) : recentCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 sm:px-5 py-6 sm:py-8 text-center text-muted-foreground text-sm sm:text-base">
                        No recent calls
                      </td>
                    </tr>
                  ) : (
                    recentCalls.map((call, index) => {
                      const Icon = typeIcons[call.type];
                      return (
                        <tr
                          key={call.id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
                            <span className="font-medium text-foreground text-sm sm:text-base">{call.contact}</span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-muted-foreground text-sm sm:text-base hidden sm:table-cell">{call.agent}</td>
                          <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", typeColors[call.type])} />
                              <span className="capitalize text-muted-foreground text-sm sm:text-base">{call.type}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-muted-foreground text-sm sm:text-base hidden lg:table-cell">{call.duration}</td>
                          <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-muted-foreground text-sm sm:text-base">{call.time}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
        </table>
      </div>
    </div>
  );
}
