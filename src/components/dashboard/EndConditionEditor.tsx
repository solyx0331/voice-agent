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

export interface EndCondition {
  enabled: boolean;
  condition?: string;
  endMessage?: string;
}

interface EndConditionEditorProps {
  endCondition?: EndCondition;
  onEndConditionChange: (endCondition: EndCondition | undefined) => void;
}

export function EndConditionEditor({
  endCondition,
  onEndConditionChange,
}: EndConditionEditorProps) {
  const [isOpen, setIsOpen] = useState(!!endCondition?.enabled);

  const enableEndCondition = () => {
    onEndConditionChange({
      enabled: true,
      condition: "allRequiredFieldsFilled",
      endMessage: "Thank you for providing all the information. One of our team members will contact you shortly.",
    });
    setIsOpen(true);
  };

  const disableEndCondition = () => {
    onEndConditionChange(undefined);
    setIsOpen(false);
  };

  const updateEndCondition = (updates: Partial<EndCondition>) => {
    if (!endCondition) return;
    onEndConditionChange({ ...endCondition, ...updates });
  };

  const conditionOptions = [
    { value: "allRequiredFieldsFilled", label: "All Required Fields Filled" },
    { value: "specificFieldFilled", label: "Specific Field Filled" },
    { value: "intentMatched", label: "Intent Matched" },
    { value: "custom", label: "Custom Condition" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">End Condition</Label>
        {endCondition?.enabled ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={disableEndCondition}
          >
            <X className="h-4 w-4 mr-1" />
            Disable
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enableEndCondition}
          >
            <Plus className="h-4 w-4 mr-1" />
            Enable
          </Button>
        )}
      </div>

      {endCondition?.enabled && (
        <Card>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">End Condition Configuration</CardTitle>
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
                  <Label>End Condition</Label>
                  <Select
                    value={endCondition.condition || "allRequiredFieldsFilled"}
                    onValueChange={(value) =>
                      updateEndCondition({ condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Condition that triggers early flow termination
                  </p>
                </div>

                <div>
                  <Label>End Message</Label>
                  <Textarea
                    value={endCondition.endMessage || ""}
                    onChange={(e) =>
                      updateEndCondition({ endMessage: e.target.value })
                    }
                    placeholder="Final message before ending the call"
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

