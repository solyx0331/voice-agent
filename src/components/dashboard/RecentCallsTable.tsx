import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { cn } from "@/lib/utils";

interface Call {
  id: string;
  contact: string;
  agent: string;
  type: "inbound" | "outbound" | "missed";
  duration: string;
  time: string;
  status: "completed" | "missed" | "ongoing";
}

const calls: Call[] = [
  { id: "1", contact: "John Smith", agent: "Sales Assistant", type: "inbound", duration: "4:32", time: "2 min ago", status: "completed" },
  { id: "2", contact: "Emma Wilson", agent: "Support Bot", type: "outbound", duration: "2:15", time: "15 min ago", status: "completed" },
  { id: "3", contact: "Michael Brown", agent: "Booking Agent", type: "missed", duration: "-", time: "32 min ago", status: "missed" },
  { id: "4", contact: "Sarah Davis", agent: "Sales Assistant", type: "inbound", duration: "6:48", time: "1 hr ago", status: "completed" },
  { id: "5", contact: "James Miller", agent: "Support Bot", type: "outbound", duration: "1:23", time: "2 hrs ago", status: "completed" },
];

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
            {calls.map((call, index) => {
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
