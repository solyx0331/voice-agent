import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface IntentDefinition {
  id: string;
  name: string;
  sampleUtterances: string[];
  matchingType: "semantic" | "regex";
  routingAction: string;
  enabled: boolean;
  confidenceThreshold?: number; // For semantic matching (0-1)
  regexPattern?: string; // For regex matching
  description?: string;
}

interface IntentEditorProps {
  intents: IntentDefinition[];
  onIntentsChange: (intents: IntentDefinition[]) => void;
  availableRoutingActions?: string[]; // Predefined routing actions
}

export function IntentEditor({ intents, onIntentsChange, availableRoutingActions = [] }: IntentEditorProps) {
  const [editingIntent, setEditingIntent] = useState<string | null>(null);
  const [openIntents, setOpenIntents] = useState<Set<string>>(new Set());

  const defaultRoutingActions = [
    "callback",
    "quote",
    "opt-out",
    "transfer",
    "voicemail",
    "end-call",
    "continue-flow",
    "escalate",
  ];

  const routingActions = availableRoutingActions.length > 0 
    ? availableRoutingActions 
    : defaultRoutingActions;

  const toggleIntent = (intentId: string) => {
    setOpenIntents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(intentId)) {
        newSet.delete(intentId);
      } else {
        newSet.add(intentId);
      }
      return newSet;
    });
  };

  const addIntent = () => {
    const newIntent: IntentDefinition = {
      id: `intent_${Date.now()}`,
      name: "",
      sampleUtterances: [""],
      matchingType: "semantic",
      routingAction: "continue-flow",
      enabled: true,
      confidenceThreshold: 0.7,
    };
    onIntentsChange([...intents, newIntent]);
    setEditingIntent(newIntent.id);
    setOpenIntents(prev => new Set(prev).add(newIntent.id));
  };

  const removeIntent = (intentId: string) => {
    onIntentsChange(intents.filter(intent => intent.id !== intentId));
    setOpenIntents(prev => {
      const newSet = new Set(prev);
      newSet.delete(intentId);
      return newSet;
    });
  };

  const updateIntent = (intentId: string, updates: Partial<IntentDefinition>) => {
    onIntentsChange(
      intents.map(intent =>
        intent.id === intentId ? { ...intent, ...updates } : intent
      )
    );
  };

  const addSampleUtterance = (intentId: string) => {
    updateIntent(intentId, {
      sampleUtterances: [...(intents.find(i => i.id === intentId)?.sampleUtterances || []), ""],
    });
  };

  const updateSampleUtterance = (intentId: string, index: number, value: string) => {
    const intent = intents.find(i => i.id === intentId);
    if (!intent) return;
    
    const newUtterances = [...intent.sampleUtterances];
    newUtterances[index] = value;
    updateIntent(intentId, { sampleUtterances: newUtterances });
  };

  const removeSampleUtterance = (intentId: string, index: number) => {
    const intent = intents.find(i => i.id === intentId);
    if (!intent) return;
    
    const newUtterances = intent.sampleUtterances.filter((_, i) => i !== index);
    updateIntent(intentId, { sampleUtterances: newUtterances });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Intent Definitions</h3>
          <p className="text-sm text-muted-foreground">
            Define intents that the agent will recognize during conversations. Intents can trigger routing actions or special behaviors.
          </p>
        </div>
        <Button type="button" onClick={addIntent} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Intent
        </Button>
      </div>

      {intents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No intents defined. Click "Add Intent" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {intents.map((intent) => (
            <Card key={intent.id} className={!intent.enabled ? "opacity-60" : ""}>
              <Collapsible
                open={openIntents.has(intent.id)}
                onOpenChange={() => toggleIntent(intent.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {openIntents.has(intent.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <div>
                          <CardTitle className="text-base">
                            {intent.name || "Unnamed Intent"}
                            {!intent.enabled && (
                              <Badge variant="secondary" className="ml-2">Disabled</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {intent.matchingType === "semantic" 
                              ? `Semantic matching (${intent.sampleUtterances.length} samples)`
                              : `Regex: ${intent.regexPattern || "Not set"}`}
                            {" → "}
                            {intent.routingAction}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIntent(intent.id, { enabled: !intent.enabled });
                          }}
                        >
                          {intent.enabled ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeIntent(intent.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`intent-name-${intent.id}`}>Intent Name *</Label>
                        <Input
                          id={`intent-name-${intent.id}`}
                          value={intent.name}
                          onChange={(e) => updateIntent(intent.id, { name: e.target.value })}
                          placeholder="e.g., Request Callback"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`intent-routing-${intent.id}`}>Routing Action *</Label>
                        <Select
                          value={intent.routingAction}
                          onValueChange={(value) => updateIntent(intent.id, { routingAction: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {routingActions.map((action) => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`intent-description-${intent.id}`}>Description (Optional)</Label>
                      <Textarea
                        id={`intent-description-${intent.id}`}
                        value={intent.description || ""}
                        onChange={(e) => updateIntent(intent.id, { description: e.target.value })}
                        placeholder="Describe when this intent should be triggered..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`intent-matching-${intent.id}`}>Matching Type *</Label>
                      <Select
                        value={intent.matchingType}
                        onValueChange={(value: "semantic" | "regex") => 
                          updateIntent(intent.id, { matchingType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semantic">Semantic (NLP-based)</SelectItem>
                          <SelectItem value="regex">Regex Pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {intent.matchingType === "semantic" ? (
                      <>
                        <div>
                          <Label htmlFor={`intent-threshold-${intent.id}`}>
                            Confidence Threshold: {intent.confidenceThreshold || 0.7}
                          </Label>
                          <input
                            type="range"
                            id={`intent-threshold-${intent.id}`}
                            min="0"
                            max="1"
                            step="0.05"
                            value={intent.confidenceThreshold || 0.7}
                            onChange={(e) =>
                              updateIntent(intent.id, { confidenceThreshold: parseFloat(e.target.value) })
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher values require closer matches. Recommended: 0.7
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Sample Utterances *</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSampleUtterance(intent.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Sample
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {intent.sampleUtterances.map((utterance, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={utterance}
                                  onChange={(e) =>
                                    updateSampleUtterance(intent.id, index, e.target.value)
                                  }
                                  placeholder="e.g., Call me back"
                                />
                                {intent.sampleUtterances.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSampleUtterance(intent.id, index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Add example phrases that users might say to trigger this intent. The more samples, the better the recognition.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label htmlFor={`intent-regex-${intent.id}`}>Regex Pattern *</Label>
                        <Input
                          id={`intent-regex-${intent.id}`}
                          value={intent.regexPattern || ""}
                          onChange={(e) => updateIntent(intent.id, { regexPattern: e.target.value })}
                          placeholder="e.g., /stop.*recording/i"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a regular expression pattern. Use /pattern/flags format or just the pattern.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

