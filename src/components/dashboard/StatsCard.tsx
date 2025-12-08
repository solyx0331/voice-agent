import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon }: StatsCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-semibold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-xs sm:text-sm font-medium truncate",
              changeType === "positive" && "text-emerald-400",
              changeType === "negative" && "text-amber-500",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-accent/30 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
        </div>
      </div>
    </div>
  );
}
