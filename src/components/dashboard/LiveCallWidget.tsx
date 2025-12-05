import { Phone, Mic, Volume2 } from "lucide-react";

export function LiveCallWidget() {
  return (
    <div className="glass-card rounded-xl p-5 border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Live Call</h2>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">Active</span>
        </div>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Jennifer Adams</p>
            <p className="text-sm text-muted-foreground">+61 412 345 678</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Agent: Sales Assistant</span>
          <span className="text-primary font-mono">03:24</span>
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-12 mb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/60 rounded-full"
            style={{
              height: `${Math.random() * 100}%`,
              animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
          <Mic className="h-5 w-5" />
        </button>
        <button className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-all">
          <Phone className="h-5 w-5" />
        </button>
        <button className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
          <Volume2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
