import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RoutingActionSelector } from "./RoutingActionSelector";

export interface GlobalRouteHandler {
  id: string;
  action: string;
  condition?: string;
  response: string;
  followUpPrompt?: string;
  endCall?: boolean;
}

interface GlobalRouteHandlersProps {
  handlers: GlobalRouteHandler[];
  onHandlersChange: (handlers: GlobalRouteHandler[]) => void;
  customRoutingActions?: string[];
  onCustomRoutingActionsChange?: (actions: string[]) => void;
}

export function GlobalRouteHandlers({
  handlers,
  onHandlersChange,
  customRoutingActions = [],
  onCustomRoutingActionsChange,
}: GlobalRouteHandlersProps) {
  const [openHandlers, setOpenHandlers] = useState<Set<string>>(new Set());

  const toggleHandler = (handlerId: string) => {
    setOpenHandlers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(handlerId)) {
        newSet.delete(handlerId);
      } else {
        newSet.add(handlerId);
      }
      return newSet;
    });
  };

  const addHandler = () => {
    const newHandler: GlobalRouteHandler = {
      id: `handler-${Date.now()}-${Math.random()}`,
      action: "opt-out",
      response: "",
      endCall: false,
    };
    onHandlersChange([...handlers, newHandler]);
    setOpenHandlers((prev) => new Set(prev).add(newHandler.id));
  };

  const removeHandler = (id: string) => {
    onHandlersChange(handlers.filter((h) => h.id !== id));
  };

  const updateHandler = (id: string, updates: Partial<GlobalRouteHandler>) => {
    onHandlersChange(
      handlers.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const defaultActions = ["opt-out", "transfer", "emergency", "voicemail", "end-call"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Global Route Handlers</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Define handlers for special actions that apply across all routes (e.g., opt-out, transfer)
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addHandler}>
          <Plus className="h-4 w-4 mr-1" />
          Add Handler
        </Button>
      </div>

      {handlers.length === 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            No global route handlers configured. Click "Add Handler" to create one.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {handlers.map((handler) => (
          <Card key={handler.id}>
            <Collapsible open={openHandlers.has(handler.id)} onOpenChange={() => toggleHandler(handler.id)}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {handler.action || "Unnamed Handler"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHandler(handler.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {openHandlers.has(handler.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Action</Label>
                    <RoutingActionSelector
                      value={handler.action}
                      onValueChange={(value) => updateHandler(handler.id, { action: value })}
                      availableActions={defaultActions}
                      customActions={customRoutingActions}
                      onAddCustomAction={(action) => {
                        if (onCustomRoutingActionsChange) {
                          onCustomRoutingActionsChange([...customRoutingActions, action]);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label>Condition (Optional)</Label>
                    <Input
                      value={handler.condition || ""}
                      onChange={(e) =>
                        updateHandler(handler.id, { condition: e.target.value })
                      }
                      placeholder='e.g., caller says "stop" or "opt out"'
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional condition for when to trigger this handler
                    </p>
                  </div>

                  <div>
                    <Label>Response Message *</Label>
                    <Textarea
                      value={handler.response}
                      onChange={(e) =>
                        updateHandler(handler.id, { response: e.target.value })
                      }
                      placeholder="Response message when handler is triggered"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Follow-up Prompt (Optional)</Label>
                    <Textarea
                      value={handler.followUpPrompt || ""}
                      onChange={(e) =>
                        updateHandler(handler.id, { followUpPrompt: e.target.value })
                      }
                      placeholder="Optional follow-up prompt after handler response"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor={`end-call-${handler.id}`}>End Call After Handler</Label>
                    <Switch
                      id={`end-call-${handler.id}`}
                      checked={handler.endCall || false}
                      onCheckedChange={(checked) =>
                        updateHandler(handler.id, { endCall: checked })
                      }
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}

