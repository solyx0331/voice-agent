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
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Calls</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Contact</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Agent</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Duration</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Time</th>
            </tr>
          </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                      </tr>
                    ))
                  ) : recentCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
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
                          <td className="px-5 py-4">
                            <span className="font-medium text-foreground">{call.contact}</span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{call.agent}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-4 w-4", typeColors[call.type])} />
                              <span className="capitalize text-muted-foreground">{call.type}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{call.duration}</td>
                          <td className="px-5 py-4 text-muted-foreground">{call.time}</td>
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
