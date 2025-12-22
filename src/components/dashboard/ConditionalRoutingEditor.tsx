import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ConditionalLogic {
  type: "field-value" | "intent-confidence" | "custom-expression";
  fieldName?: string;
  operator?: "equals" | "contains" | "greater-than" | "less-than" | "exists" | "not-exists";
  value?: any;
  intentName?: string;
  minConfidence?: number;
  expression?: string;
}

interface ConditionalRoutingEditorProps {
  conditionalLogic?: ConditionalLogic;
  onConditionalLogicChange: (logic: ConditionalLogic | undefined) => void;
  availableFields?: Array<{ id: string; fieldName: string; label: string }>;
  availableIntents?: Array<{ id: string; name: string }>;
}

export function ConditionalRoutingEditor({
  conditionalLogic,
  onConditionalLogicChange,
  availableFields = [],
  availableIntents = [],
}: ConditionalRoutingEditorProps) {
  const [isOpen, setIsOpen] = useState(!!conditionalLogic);

  const enableConditionalLogic = () => {
    onConditionalLogicChange({
      type: "field-value",
      operator: "equals",
    });
    setIsOpen(true);
  };

  const disableConditionalLogic = () => {
    onConditionalLogicChange(undefined);
    setIsOpen(false);
  };

  const updateConditionalLogic = (updates: Partial<ConditionalLogic>) => {
    if (!conditionalLogic) return;
    onConditionalLogicChange({ ...conditionalLogic, ...updates });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Conditional Routing Logic</Label>
        {conditionalLogic ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={disableConditionalLogic}
          >
            <X className="h-4 w-4 mr-1" />
            Disable
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enableConditionalLogic}
          >
            <Plus className="h-4 w-4 mr-1" />
            Enable
          </Button>
        )}
      </div>

      {conditionalLogic && (
        <Card>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {conditionalLogic.type === "field-value" && "Field Value Condition"}
                    {conditionalLogic.type === "intent-confidence" && "Intent Confidence Condition"}
                    {conditionalLogic.type === "custom-expression" && "Custom Expression Condition"}
                  </CardTitle>
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
                  <Label>Condition Type</Label>
                  <Select
                    value={conditionalLogic.type}
                    onValueChange={(value: ConditionalLogic["type"]) =>
                      updateConditionalLogic({ type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field-value">Field Value</SelectItem>
                      <SelectItem value="intent-confidence">Intent Confidence</SelectItem>
                      <SelectItem value="custom-expression">Custom Expression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {conditionalLogic.type === "field-value" && (
                  <>
                    <div>
                      <Label>Field Name</Label>
                      <Select
                        value={conditionalLogic.fieldName || ""}
                        onValueChange={(value) =>
                          updateConditionalLogic({ fieldName: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.id} value={field.fieldName}>
                              {field.label} ({field.fieldName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={conditionalLogic.operator || "equals"}
                        onValueChange={(value: ConditionalLogic["operator"]) =>
                          updateConditionalLogic({ operator: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater-than">Greater Than</SelectItem>
                          <SelectItem value="less-than">Less Than</SelectItem>
                          <SelectItem value="exists">Exists</SelectItem>
                          <SelectItem value="not-exists">Not Exists</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {conditionalLogic.operator !== "exists" && conditionalLogic.operator !== "not-exists" && (
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={conditionalLogic.value || ""}
                          onChange={(e) =>
                            updateConditionalLogic({ value: e.target.value })
                          }
                          placeholder="Comparison value"
                        />
                      </div>
                    )}
                  </>
                )}

                {conditionalLogic.type === "intent-confidence" && (
                  <>
                    <div>
                      <Label>Intent Name</Label>
                      <Select
                        value={conditionalLogic.intentName || ""}
                        onValueChange={(value) =>
                          updateConditionalLogic({ intentName: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select intent" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIntents.map((intent) => (
                            <SelectItem key={intent.id} value={intent.name}>
                              {intent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Minimum Confidence (0-1)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={conditionalLogic.minConfidence || 0.7}
                        onChange={(e) =>
                          updateConditionalLogic({
                            minConfidence: parseFloat(e.target.value) || 0.7,
                          })
                        }
                        placeholder="0.7"
                      />
                    </div>
                  </>
                )}

                {conditionalLogic.type === "custom-expression" && (
                  <div>
                    <Label>Expression</Label>
                    <Textarea
                      value={conditionalLogic.expression || ""}
                      onChange={(e) =>
                        updateConditionalLogic({ expression: e.target.value })
                      }
                      placeholder='e.g., field.email && field.phone || intent.callback.confidence > 0.8'
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use field.fieldName, intent.intentName.confidence, or custom expressions
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}

