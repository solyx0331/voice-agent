import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, User, Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { IntentDefinition } from "./IntentEditor";
import { FieldSchema } from "./FieldSchemaDesigner";

interface ConversationMessage {
  speaker: "agent" | "user";
  text: string;
  timestamp: Date;
  intentDetected?: string;
  fieldsExtracted?: Record<string, any>;
}

interface ConversationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intents: IntentDefinition[];
  fields: FieldSchema[];
  greetingMessage: string;
  routingLogics?: any[];
}

export function ConversationPreview({
  open,
  onOpenChange,
  intents,
  fields,
  greetingMessage,
  routingLogics = [],
}: ConversationPreviewProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [collectedFields, setCollectedFields] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<"greeting" | "routing" | "collecting" | "complete">("greeting");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (open && greetingMessage) {
      // Start with greeting
      setMessages([
        {
          speaker: "agent",
          text: greetingMessage,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep("greeting");
      setCollectedFields({});
    }
  }, [open, greetingMessage]);

  const resetPreview = () => {
    setMessages([]);
    setCurrentUserInput("");
    setCollectedFields({});
    setCurrentStep("greeting");
    if (greetingMessage) {
      setMessages([
        {
          speaker: "agent",
          text: greetingMessage,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const detectIntent = (utterance: string): string | null => {
    const lowerUtterance = utterance.toLowerCase();
    
    for (const intent of intents.filter(i => i.enabled)) {
      if (intent.matchingType === "regex" && intent.regexPattern) {
        try {
          const regex = new RegExp(intent.regexPattern.replace(/^\/|\/[gimuy]*$/g, ""), "i");
          if (regex.test(utterance)) {
            return intent.name;
          }
        } catch (e) {
          console.error("Invalid regex pattern:", intent.regexPattern);
        }
      } else if (intent.matchingType === "semantic") {
        // Simple keyword matching for preview (in production, use embeddings)
        const utteranceWords = lowerUtterance.split(/\s+/);
        for (const sample of intent.sampleUtterances) {
          const sampleWords = sample.toLowerCase().split(/\s+/);
          const matchCount = sampleWords.filter(word => utteranceWords.includes(word)).length;
          const similarity = matchCount / Math.max(sampleWords.length, utteranceWords.length);
          if (similarity >= (intent.confidenceThreshold || 0.7)) {
            return intent.name;
          }
        }
      }
    }
    return null;
  };

  const extractFields = (utterance: string): Record<string, any> => {
    const extracted: Record<string, any> = {};
    
    for (const field of fields) {
      if (collectedFields[field.fieldName]) continue; // Already collected
      
      // Simple extraction based on data type
      if (field.dataType === "email") {
        const emailMatch = utterance.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          extracted[field.fieldName] = emailMatch[0];
        }
      } else if (field.dataType === "phone") {
        const phoneMatch = utterance.match(/(?:\+?61|0)?[2-478](?:[ -]?[0-9]){8}/);
        if (phoneMatch) {
          extracted[field.fieldName] = phoneMatch[0];
        }
      } else if (field.dataType === "number") {
        const numberMatch = utterance.match(/\d+/);
        if (numberMatch) {
          extracted[field.fieldName] = parseInt(numberMatch[0]);
        }
      } else if (field.nlpExtractionHints && field.nlpExtractionHints.length > 0) {
        // Check if any hint is mentioned
        const lowerUtterance = utterance.toLowerCase();
        for (const hint of field.nlpExtractionHints) {
          if (lowerUtterance.includes(hint.toLowerCase())) {
            // Try to extract value after the hint
            const hintIndex = lowerUtterance.indexOf(hint.toLowerCase());
            const afterHint = utterance.substring(hintIndex + hint.length).trim();
            const valueMatch = afterHint.match(/^[^\s,]+/);
            if (valueMatch) {
              extracted[field.fieldName] = valueMatch[0];
            }
          }
        }
      }
    }
    
    return extracted;
  };

  const getNextAgentResponse = (userUtterance: string, detectedIntent: string | null, extractedFields: Record<string, any>): string => {
    // Update collected fields
    const newCollectedFields = { ...collectedFields, ...extractedFields };
    setCollectedFields(newCollectedFields);

    // Check if intent was detected
    if (detectedIntent) {
      const intent = intents.find(i => i.name === detectedIntent);
      if (intent) {
        if (intent.routingAction === "callback") {
          setCurrentStep("complete");
          return "Understood. I'll have someone call you back shortly. Thank you for your interest!";
        } else if (intent.routingAction === "end-call") {
          setCurrentStep("complete");
          return "Thank you for calling. Have a great day!";
        }
      }
    }

    // Check if all required fields are collected
    const requiredFields = fields.filter(f => f.required);
    const missingRequired = requiredFields.filter(f => !newCollectedFields[f.fieldName]);
    
    if (missingRequired.length === 0 && requiredFields.length > 0) {
      setCurrentStep("complete");
      return "Perfect! I have all the information I need. One of our team members will be in touch shortly. Thank you!";
    }

    // Find next missing required field
    const nextField = missingRequired[0] || fields.find(f => !newCollectedFields[f.fieldName]);
    
    if (nextField && nextField.promptText) {
      setCurrentStep("collecting");
      return nextField.promptText;
    }

    return "Thank you for that information. Is there anything else I can help you with?";
  };

  const handleUserMessage = () => {
    if (!currentUserInput.trim()) return;

    const userMessage: ConversationMessage = {
      speaker: "user",
      text: currentUserInput,
      timestamp: new Date(),
    };

    // Detect intent
    const detectedIntent = detectIntent(currentUserInput);
    if (detectedIntent) {
      userMessage.intentDetected = detectedIntent;
    }

    // Extract fields
    const extractedFields = extractFields(currentUserInput);
    if (Object.keys(extractedFields).length > 0) {
      userMessage.fieldsExtracted = extractedFields;
    }

    setMessages(prev => [...prev, userMessage]);

    // Get agent response
    const agentResponse = getNextAgentResponse(currentUserInput, detectedIntent || null, extractedFields);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          speaker: "agent",
          text: agentResponse,
          timestamp: new Date(),
        },
      ]);
    }, 500);

    setCurrentUserInput("");
  };

  const requiredFields = fields.filter(f => f.required);
  const collectedRequired = requiredFields.filter(f => collectedFields[f.fieldName]);
  const allRequiredCollected = requiredFields.length > 0 && collectedRequired.length === requiredFields.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation Preview</DialogTitle>
          <DialogDescription>
            Simulate a conversation with your agent to test intent recognition and field extraction.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Status Panel */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Intents Detected</div>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.intentDetected).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Fields Collected</div>
                <div className="text-2xl font-bold">
                  {Object.keys(collectedFields).length} / {fields.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Required Fields</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {collectedRequired.length} / {requiredFields.length}
                  {allRequiredCollected && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collected Fields Display */}
          {Object.keys(collectedFields).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-semibold mb-2">Collected Data:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(collectedFields).map(([key, value]) => {
                    const field = fields.find(f => f.fieldName === key);
                    return (
                      <Badge key={key} variant="outline">
                        {field?.label || key}: {String(value)}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Messages */}
          <ScrollArea className="flex-1 border rounded-lg p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.speaker === "agent" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.speaker === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    {message.intentDetected && (
                      <Badge variant="secondary" className="mt-2">
                        Intent: {message.intentDetected}
                      </Badge>
                    )}
                    {message.fieldsExtracted && Object.keys(message.fieldsExtracted).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(message.fieldsExtracted).map(([key, value]) => {
                          const field = fields.find(f => f.fieldName === key);
                          return (
                            <Badge key={key} variant="outline" className="mr-1">
                              {field?.label || key}: {String(value)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {message.speaker === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={currentUserInput}
              onChange={(e) => setCurrentUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleUserMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={currentStep === "complete"}
            />
            <Button onClick={handleUserMessage} disabled={currentStep === "complete"}>
              Send
            </Button>
            <Button variant="outline" onClick={resetPreview}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

