import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, GitBranch, MessageSquare, Database } from "lucide-react";

interface RoutingLogic {
  id: string;
  name: string;
  condition: string;
  action: string;
  response: string;
  informationGathering?: Array<{ question: string }>;
  fieldSchemas?: Array<{ id: string; label: string; fieldName: string; dataType: string; required: boolean }>;
  completionResponse?: string;
  routingLogics?: RoutingLogic[];
}

interface RoutingPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  greetingMessage: string;
  routingLogics: RoutingLogic[];
}

interface RoutingNodeProps {
  routing: RoutingLogic;
  level: number;
  index: number;
  isLast: boolean;
}

const RoutingNode = ({ routing, level, index, isLast }: RoutingNodeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2); // Auto-expand first 2 levels
  
  const hasNested = routing.routingLogics && routing.routingLogics.length > 0;
  const indent = level * 24;

  return (
    <div className="relative">
      {/* Connection line */}
      {level > 0 && (
        <div
          className="absolute border-l-2 border-primary/30"
          style={{
            left: `${indent - 12}px`,
            top: '-8px',
            height: isLast ? '20px' : '100%',
            width: '1px',
          }}
        />
      )}
      
      <div
        className="relative"
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Node content */}
        <div
          className={cn(
            "group relative mb-2 rounded-lg border-2 p-3 transition-all hover:shadow-md",
            level === 0
              ? "bg-primary/10 border-primary/50"
              : level === 1
              ? "bg-blue-500/10 border-blue-500/50"
              : "bg-purple-500/10 border-purple-500/50"
          )}
        >
          {/* Node header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {hasNested && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0.5 hover:bg-background/50 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <GitBranch className={cn(
                    "h-4 w-4",
                    level === 0 ? "text-primary" : level === 1 ? "text-blue-500" : "text-purple-500"
                  )} />
                  <h4 className={cn(
                    "font-semibold text-sm",
                    level === 0 ? "text-primary" : level === 1 ? "text-blue-700 dark:text-blue-400" : "text-purple-700 dark:text-purple-400"
                  )}>
                    {routing.name || `Routing ${index + 1}`}
                  </h4>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span className="text-xs font-medium text-muted-foreground">Condition</span>
                </div>
                <p className="text-xs text-foreground bg-background/50 rounded px-2 py-1">
                  {routing.condition || <span className="text-muted-foreground italic">Not set</span>}
                </p>
              </div>

              {/* Action */}
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-muted-foreground">Action</span>
                </div>
                <p className="text-xs text-foreground bg-background/50 rounded px-2 py-1">
                  {routing.action || <span className="text-muted-foreground italic">Not set</span>}
                </p>
              </div>

              {/* Response */}
              {routing.response && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3 text-cyan-500" />
                    <span className="text-xs font-medium text-muted-foreground">Response</span>
                  </div>
                  <p className="text-xs text-foreground bg-background/50 rounded px-2 py-1 line-clamp-2">
                    {routing.response}
                  </p>
                </div>
              )}

              {/* Completion Response */}
              {routing.completionResponse && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-muted-foreground">Completion Response</span>
                  </div>
                  <p className="text-xs text-foreground bg-green-500/10 border border-green-500/20 rounded px-2 py-1 line-clamp-2">
                    {routing.completionResponse}
                  </p>
                </div>
              )}

              {/* Data collection badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {routing.informationGathering && routing.informationGathering.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-xs">
                    <Database className="h-3 w-3" />
                    <span>{routing.informationGathering.length} Info</span>
                  </div>
                )}
                {routing.fieldSchemas && routing.fieldSchemas.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                    <Database className="h-3 w-3" />
                    <span>{routing.fieldSchemas.length} Fields</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nested routing logics */}
        {hasNested && isExpanded && (
          <div className="relative">
            {routing.routingLogics!.map((nested, nestedIndex) => (
              <RoutingNode
                key={nested.id}
                routing={nested}
                level={level + 1}
                index={nestedIndex}
                isLast={nestedIndex === routing.routingLogics!.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function RoutingPreview({ open, onOpenChange, greetingMessage, routingLogics }: RoutingPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Routing Logic Preview</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Visual representation of your routing logic hierarchy
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* Greeting/Initial Logic */}
            <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base text-primary">Initial Logic / Greeting</h3>
              </div>
              <p className="text-sm text-foreground bg-background/50 rounded px-3 py-2 whitespace-pre-wrap">
                {greetingMessage || <span className="text-muted-foreground italic">No greeting message set</span>}
              </p>
            </div>

            {/* Routing Logic Tree */}
            {routingLogics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No routing logic configured yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {routingLogics.map((routing, index) => (
                  <RoutingNode
                    key={routing.id}
                    routing={routing}
                    level={0}
                    index={index}
                    isLast={index === routingLogics.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <h4 className="text-sm font-semibold">Legend</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-primary/50 bg-primary/10" />
                  <span>Level 1 (Primary Routing)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-blue-500/50 bg-blue-500/10" />
                  <span>Level 2 (Nested Routing)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>Condition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>Action</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

