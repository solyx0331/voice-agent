import { cn } from "@/lib/utils";
import { Mic, MoreVertical, Phone } from "lucide-react";

interface VoiceAgentCardProps {
  name: string;
  description: string;
  status: "active" | "inactive" | "busy";
  calls: number;
  avgDuration: string;
}

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500", ring: "ring-emerald-500/30" },
  inactive: { label: "Inactive", color: "bg-muted-foreground", ring: "ring-muted-foreground/30" },
  busy: { label: "On Call", color: "bg-primary", ring: "ring-primary/30" },
};

export function VoiceAgentCard({ name, description, status, calls, avgDuration }: VoiceAgentCardProps) {
  const config = statusConfig[status];

  return (
    <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            {status === "busy" && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary animate-pulse-ring" />
            )}
            <span className={cn(
              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card",
              config.color
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className={cn("h-2 w-2 rounded-full", config.color)} />
          <span className="text-muted-foreground">{config.label}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{calls} calls</span>
          </div>
          <span>Avg: {avgDuration}</span>
        </div>
      </div>
    </div>
  );
}
