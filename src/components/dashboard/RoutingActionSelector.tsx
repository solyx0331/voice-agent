import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, ChevronsUpDown, Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Routing action descriptions (matches backend config)
const ROUTING_ACTION_DESCRIPTIONS: Record<string, string> = {
  "callback": "Collect contact information and terminate the call. Agent will ask for name and phone number, then end the call.",
  "quote": "Collect quotation details and continue with pricing flow. Agent will gather product/service details and budget information.",
  "continue-flow": "Continue to the next question in the conversation flow. This is the default action when no specific intent matches.",
  "opt-out": "Handle opt-out request (e.g., stop recording, unsubscribe). Agent will acknowledge and stop the requested action.",
  "transfer": "Transfer the call to a human representative. Agent will collect basic info and connect to a live agent.",
  "voicemail": "Route to voicemail. Agent will prompt caller to leave a message.",
  "end-call": "End the call immediately. Agent will provide a closing message and terminate.",
  "escalate": "Escalate to higher priority handling. Agent will collect urgent details and flag for immediate follow-up.",
};

interface RoutingActionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  availableActions: string[]; // Combined default + custom actions
  customActions: string[]; // Only custom actions
  onAddCustomAction: (action: string) => void; // Callback to add new custom action
  showTooltips?: boolean; // Whether to show tooltips with descriptions
}

export function RoutingActionSelector({
  value,
  onValueChange,
  availableActions,
  customActions,
  onAddCustomAction,
  showTooltips = true,
}: RoutingActionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate custom action name
  const validateActionName = (actionName: string): string | null => {
    if (!actionName || actionName.trim().length === 0) {
      return "Action name cannot be empty";
    }

    // Allow alphanumeric, hyphens, underscores, lowercase
    const validPattern = /^[a-z0-9_-]+$/;
    if (!validPattern.test(actionName)) {
      return "Action name must contain only lowercase letters, numbers, hyphens, and underscores";
    }

    // Min length
    if (actionName.length < 2) {
      return "Action name must be at least 2 characters";
    }

    // Max length
    if (actionName.length > 50) {
      return "Action name must be 50 characters or less";
    }

    // Check if already exists
    if (availableActions.includes(actionName.toLowerCase())) {
      return "This action already exists";
    }

    return null;
  };

  const handleCreateCustom = () => {
    const trimmed = inputValue.trim().toLowerCase();
    const error = validateActionName(trimmed);
    
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onAddCustomAction(trimmed);
    onValueChange(trimmed);
    setInputValue("");
    setIsCreating(false);
    setOpen(false);
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "__create_new__") {
      setIsCreating(true);
      setInputValue("");
      setValidationError(null);
      // Focus input after popover opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }

    onValueChange(selectedValue);
    setOpen(false);
    setIsCreating(false);
    setInputValue("");
  };

  const filteredActions = availableActions.filter((action) =>
    action.toLowerCase().includes(inputValue.toLowerCase())
  );

  const displayValue = value || "Select action";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {value || "Select action..."}
            {customActions.includes(value) && (
              <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          {!isCreating && (
            <>
              <CommandInput
                placeholder="Search actions or type to create new..."
                value={inputValue}
                onValueChange={(search) => {
                  setInputValue(search);
                  setValidationError(null);
                  // If input doesn't match any existing action, show create option
                  if (search.trim().length > 0 && !availableActions.includes(search.toLowerCase())) {
                    // Will show in CommandEmpty
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>
                  {inputValue.trim().length > 0 ? (
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsCreating(true);
                          inputRef.current?.focus();
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create &quot;{inputValue}&quot;
                      </Button>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No actions found.
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup heading="Standard Actions">
                  {filteredActions
                    .filter((action) => !customActions.includes(action))
                    .map((action) => {
                      const description = ROUTING_ACTION_DESCRIPTIONS[action.toLowerCase()];
                      return (
                        <CommandItem
                          key={action}
                          value={action}
                          onSelect={() => handleSelect(action)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center flex-1">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === action ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{action}</span>
                          </div>
                          {showTooltips && description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 ml-2 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <p className="text-xs">{description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
                {customActions.length > 0 && (
                  <CommandGroup heading="Custom Actions">
                    {filteredActions
                      .filter((action) => customActions.includes(action))
                      .map((action) => (
                        <CommandItem
                          key={action}
                          value={action}
                          onSelect={() => handleSelect(action)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === action ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {action}
                          <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                <CommandGroup>
                  <CommandItem
                    value="__create_new__"
                    onSelect={() => handleSelect("__create_new__")}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom Action
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </>
          )}
          {isCreating && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Create Custom Action</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setInputValue("");
                    setValidationError(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  placeholder="e.g., schedule-appointment"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setValidationError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCustom();
                    } else if (e.key === "Escape") {
                      setIsCreating(false);
                      setInputValue("");
                      setValidationError(null);
                    }
                  }}
                />
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Use lowercase letters, numbers, hyphens, and underscores only</p>
                  <p>• Must be 2-50 characters long</p>
                  <p>• Examples: schedule-appointment, check-status, request-info</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleCreateCustom}
                    size="sm"
                    className="flex-1"
                    disabled={!inputValue.trim() || !!validateActionName(inputValue.trim().toLowerCase())}
                  >
                    Create Action
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setInputValue("");
                      setValidationError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

