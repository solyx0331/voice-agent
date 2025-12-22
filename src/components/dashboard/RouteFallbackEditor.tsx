import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RoutingActionSelector } from "./RoutingActionSelector";

export interface RouteFallback {
  enabled: boolean;
  maxAttempts?: number;
  fallbackMessage?: string;
  escalationAction?: string;
  escalationMessage?: string;
}

interface RouteFallbackEditorProps {
  fallback?: RouteFallback;
  onFallbackChange: (fallback: RouteFallback | undefined) => void;
  customRoutingActions?: string[];
  onCustomRoutingActionsChange?: (actions: string[]) => void;
}

export function RouteFallbackEditor({
  fallback,
  onFallbackChange,
  customRoutingActions = [],
  onCustomRoutingActionsChange,
}: RouteFallbackEditorProps) {
  const [isOpen, setIsOpen] = useState(!!fallback?.enabled);

  const enableFallback = () => {
    onFallbackChange({
      enabled: true,
      maxAttempts: 2,
      fallbackMessage: "I'm having trouble understanding. Let me help you another way.",
      escalationAction: "transfer",
      escalationMessage: "Let me transfer you to a human representative.",
    });
    setIsOpen(true);
  };

  const disableFallback = () => {
    onFallbackChange(undefined);
    setIsOpen(false);
  };

  const updateFallback = (updates: Partial<RouteFallback>) => {
    if (!fallback) return;
    onFallbackChange({ ...fallback, ...updates });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Fallback & Escalation</Label>
        {fallback?.enabled ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={disableFallback}
          >
            <X className="h-4 w-4 mr-1" />
            Disable
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enableFallback}
          >
            <Plus className="h-4 w-4 mr-1" />
            Enable
          </Button>
        )}
      </div>

      {fallback?.enabled && (
        <Card>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Fallback Configuration</CardTitle>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max Failed Attempts</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={fallback.maxAttempts || 2}
                    onChange={(e) =>
                      updateFallback({
                        maxAttempts: parseInt(e.target.value) || 2,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of failed attempts before fallback triggers
                  </p>
                </div>

                <div>
                  <Label>Fallback Message</Label>
                  <Textarea
                    value={fallback.fallbackMessage || ""}
                    onChange={(e) =>
                      updateFallback({ fallbackMessage: e.target.value })
                    }
                    placeholder="Message when fallback triggers"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Escalation Action</Label>
                  <RoutingActionSelector
                    value={fallback.escalationAction || ""}
                    onValueChange={(value) =>
                      updateFallback({ escalationAction: value })
                    }
                    availableActions={["transfer", "voicemail", "end-call", "callback", "escalate"]}
                    customActions={customRoutingActions}
                    onAddCustomAction={(action) => {
                      if (onCustomRoutingActionsChange) {
                        onCustomRoutingActionsChange([...customRoutingActions, action]);
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>Escalation Message</Label>
                  <Textarea
                    value={fallback.escalationMessage || ""}
                    onChange={(e) =>
                      updateFallback({ escalationMessage: e.target.value })
                    }
                    placeholder="Message for escalation"
                    rows={2}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}

