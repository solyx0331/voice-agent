import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents, calls, contacts..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Agent
        </Button>
        
        <button className="relative h-10 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">ES</span>
        </div>
      </div>
    </header>
  );
}
