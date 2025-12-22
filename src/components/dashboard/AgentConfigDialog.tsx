import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2, Clock, Mail, Globe, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RoutingPreview } from "./RoutingPreview";
import { IntentEditor, IntentDefinition } from "./IntentEditor";
import { FieldSchemaDesigner, FieldSchema } from "./FieldSchemaDesigner";
import { ConversationPreview } from "./ConversationPreview";
import { toast } from "sonner";
import { apiService } from "@/lib/api/api";
import { VoiceAgent } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: VoiceAgent | null;
  onSave: (agent: Partial<VoiceAgent>) => Promise<void>;
  isSaving?: boolean;
}

export function AgentConfigDialog({ open, onOpenChange, agent, onSave, isSaving = false }: AgentConfigDialogProps) {
  const navigate = useNavigate();
  const [availableVoices, setAvailableVoices] = useState<Array<{
    voice_id: string;
    voice_name: string;
    provider: string;
    display_name: string;
  }>>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [customVoices, setCustomVoices] = useState<Array<{
    id: string;
    name: string;
    voiceId: string;
    url: string;
    createdAt: string;
    type: "uploaded" | "recorded";
  }>>([]);
  const [customVoicesLoading, setCustomVoicesLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConversationPreviewOpen, setIsConversationPreviewOpen] = useState(false);
  
  // State for collapsible sections
  const [isGreetingOpen, setIsGreetingOpen] = useState(true);
  const [isIntentEditorOpen, setIsIntentEditorOpen] = useState(false);
  const [isFieldSchemaOpen, setIsFieldSchemaOpen] = useState(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState(true);
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(true);
  const [isFallbackOpen, setIsFallbackOpen] = useState(true);
  
  // State for collapsible routing logic blocks (using Set to track open blocks)
  const [openRoutingBlocks, setOpenRoutingBlocks] = useState<Set<string>>(new Set());
  const [openNestedRoutingBlocks, setOpenNestedRoutingBlocks] = useState<Set<string>>(new Set());
  
  // Helper functions to toggle routing blocks
  const toggleRoutingBlock = (routingId: string) => {
    setOpenRoutingBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routingId)) {
        newSet.delete(routingId);
      } else {
        newSet.add(routingId);
      }
      return newSet;
    });
  };
  
  const toggleNestedRoutingBlock = (nestedRoutingId: string) => {
    setOpenNestedRoutingBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nestedRoutingId)) {
        newSet.delete(nestedRoutingId);
      } else {
        newSet.add(nestedRoutingId);
      }
      return newSet;
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    status: "inactive" as "active" | "inactive" | "busy",
    voice: {
      type: "generic" as "generic" | "custom",
      genericVoice: "", // Will be set from available voices (preferring Australian)
      customVoiceId: "",
      customVoiceUrl: "",
    },
    greetingScript: "",
    ambientSound: undefined as "coffee-shop" | "convention-hall" | "summer-outdoor" | "mountain-outdoor" | "static-noise" | "call-center" | undefined,
    ambientSoundVolume: 1.0, // Default volume
    enableRecording: true, // Default to enabled
    faqs: [] as Array<{ question: string; answer: string }>,
    intents: [] as Array<{ name: string; prompt: string; response?: string }>,
    intentDefinitions: [] as IntentDefinition[],
    fieldSchemas: [] as FieldSchema[],
    schemaVersion: "2.0",
    customRoutingActions: [] as string[],
    callRules: {
      businessHours: {
        enabled: false,
        timezone: "UTC-8 (Pacific Time)",
        schedule: [] as Array<{ day: string; start: string; end: string }>,
      },
      fallbackToVoicemail: false,
      voicemailMessage: "",
      secondAttemptMessage: "I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?",
    },
    leadCapture: {
      fields: [] as Array<{ name: string; question: string; required: boolean; type: "text" | "email" | "phone" | "number" }>,
    },
    notifications: {
      email: "",
      crm: {
        type: "webhook" as "webhook" | "salesforce" | "hubspot" | "zapier",
        endpoint: "",
        apiKey: "",
      },
    },
    emailTemplate: {
      subjectFormat: "New Inquiry - {{CompanyName}} - {{CallerName}}",
      bodyTemplate: `Company: {{CompanyName}}

Name: {{CallerName}}

Phone: {{PhoneNumber}}

Email: {{Email}}

Service Interested In: {{ServiceType}}

Budget (if provided): {{Budget}}

Business Type (if provided): {{BusinessType}}

Company Size (QW Direct): {{CompanySize}}

Timeline: {{Timeline}}

Call Summary:

{{AgentGeneratedSummary}}`,
    },
    baseLogic: {
      greetingMessage: "",
      routingLogics: [] as Array<{
        id: string;
        name: string;
        condition: string;
        action: string;
        response: string;
        informationGathering: Array<{ question: string }>;
        leadCaptureFields: Array<{ name: string; question: string; required: boolean; type: "text" | "email" | "phone" | "number" }>;
        completionResponse?: string; // Response after collecting information/lead data
        routingLogics?: Array<{
          id: string;
          name: string;
          condition: string;
          action: string;
          response: string;
          informationGathering: Array<{ question: string }>;
          leadCaptureFields: Array<{ name: string; question: string; required: boolean; type: "text" | "email" | "phone" | "number" }>;
          completionResponse?: string; // Response after collecting information/lead data
          routingLogics?: Array<any>; // Recursive for deeper nesting
        }>;
      }>,
    },
  });

  // Fetch available voices and custom voices when dialog opens
  useEffect(() => {
    if (open) {
      setVoicesLoading(true);
      setCustomVoicesLoading(true);
      
      // Fetch generic voices from Retell
      apiService.getAvailableVoices()
        .then((voices) => {
          setAvailableVoices(voices);
          console.log("Available voices:", voices);
          // Set default voice if none selected and voices are available
          // Only use Australian voices
          const australianVoices = voices.filter((v: any) => v.isAustralian);
          if (australianVoices.length > 0 && !formData.voice.genericVoice) {
            setFormData(prev => ({
              ...prev,
              voice: {
                ...prev.voice,
                genericVoice: australianVoices[0].display_name,
              },
            }));
          }
        })
        .catch((error) => {
          console.error("Failed to fetch voices:", error);
          toast.error("Failed to load available voices");
        })
        .finally(() => {
          setVoicesLoading(false);
        });

      // Fetch custom voices
      apiService.getCustomVoices()
        .then((voices) => {
          setCustomVoices(voices);
          console.log("Custom voices:", voices);
        })
        .catch((error) => {
          console.error("Failed to fetch custom voices:", error);
          // Don't show error toast as this is optional
        })
        .finally(() => {
          setCustomVoicesLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        status: agent.status || "inactive",
        voice: {
          type: agent.voice?.type || "generic",
          genericVoice: agent.voice?.genericVoice || (availableVoices.filter((v: any) => v.isAustralian).length > 0 ? availableVoices.filter((v: any) => v.isAustralian)[0].display_name : ""),
          customVoiceId: agent.voice?.customVoiceId || "",
          customVoiceUrl: agent.voice?.customVoiceUrl || "",
        },
        greetingScript: agent.greetingScript || "",
        faqs: agent.faqs || [],
        intents: agent.intents || [],
        intentDefinitions: agent.intentDefinitions || [],
        fieldSchemas: agent.fieldSchemas || [],
        schemaVersion: agent.schemaVersion || "2.0",
        customRoutingActions: (() => {
          // Extract custom actions from existing intents if customRoutingActions is not set
          const defaultActions = ["callback", "quote", "opt-out", "transfer", "voicemail", "end-call", "continue-flow", "escalate"];
          const existingCustomActions = agent.customRoutingActions || [];
          const intentActions = (agent.intentDefinitions || [])
            .map(intent => intent.routingAction)
            .filter(action => action && !defaultActions.includes(action) && !existingCustomActions.includes(action));
          // Combine and deduplicate
          return [...new Set([...existingCustomActions, ...intentActions])];
        })(),
        callRules: {
          businessHours: {
            enabled: agent.callRules?.businessHours?.enabled || false,
            timezone: agent.callRules?.businessHours?.timezone || "UTC-8 (Pacific Time)",
            schedule: agent.callRules?.businessHours?.schedule || [],
          },
          fallbackToVoicemail: agent.callRules?.fallbackToVoicemail || false,
          voicemailMessage: agent.callRules?.voicemailMessage || "",
          secondAttemptMessage: agent.callRules?.secondAttemptMessage || "I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?",
        },
        leadCapture: agent.leadCapture || { fields: [] },
        notifications: {
          email: agent.notifications?.email || "",
          crm: {
            type: agent.notifications?.crm?.type || "webhook",
            endpoint: agent.notifications?.crm?.endpoint || "",
            apiKey: agent.notifications?.crm?.apiKey || "",
          },
        },
        emailTemplate: agent.emailTemplate || {
          subjectFormat: "New Inquiry - {{CompanyName}} - {{CallerName}}",
          bodyTemplate: `Company: {{CompanyName}}

Name: {{CallerName}}

Phone: {{PhoneNumber}}

Email: {{Email}}

Service Interested In: {{ServiceType}}

Budget (if provided): {{Budget}}

Business Type (if provided): {{BusinessType}}

Company Size (QW Direct): {{CompanySize}}

Timeline: {{Timeline}}

Call Summary:

{{AgentGeneratedSummary}}`,
        },
        baseLogic: {
          greetingMessage: agent.baseLogic?.greetingMessage || "",
          routingLogics: agent.baseLogic?.routingLogics || (agent.baseLogic?.responseLogic ? agent.baseLogic.responseLogic.map((rl, idx) => ({
            id: `routing-${idx}`,
            name: `Routing Logic ${idx + 1}`,
            condition: rl.condition,
            action: rl.action,
            response: rl.response,
            informationGathering: agent.baseLogic?.leadCaptureQuestions || [],
            leadCaptureFields: agent.leadCapture?.fields || [],
          })) : []),
        },
        ambientSound: agent.ambientSound,
        ambientSoundVolume: agent.ambientSoundVolume ?? 1.0,
        enableRecording: agent.enableRecording !== undefined ? agent.enableRecording : true,
      });
    } else {
      // Reset form for new agent
      setFormData({
        name: "",
        description: "",
        systemPrompt: "",
        status: "inactive",
        voice: {
          type: "generic",
          genericVoice: availableVoices.filter((v: any) => v.isAustralian).length > 0 ? availableVoices.filter((v: any) => v.isAustralian)[0].display_name : "",
          customVoiceId: "",
          customVoiceUrl: "",
        },
        greetingScript: "",
        ambientSound: undefined,
        ambientSoundVolume: 1.0,
        enableRecording: true,
        faqs: [],
        intents: [],
        intentDefinitions: [],
        fieldSchemas: [],
        schemaVersion: "2.0",
        customRoutingActions: [],
        callRules: {
          businessHours: {
            enabled: false,
            timezone: "UTC-8 (Pacific Time)",
            schedule: [],
          },
          fallbackToVoicemail: false,
          voicemailMessage: "",
          secondAttemptMessage: "I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?",
        },
        leadCapture: { fields: [] },
        notifications: {
          email: "",
          crm: { type: "webhook", endpoint: "", apiKey: "" },
        },
        emailTemplate: {
          subjectFormat: "New Inquiry - {{CompanyName}} - {{CallerName}}",
          bodyTemplate: `Company: {{CompanyName}}

Name: {{CallerName}}

Phone: {{PhoneNumber}}

Email: {{Email}}

Service Interested In: {{ServiceType}}

Budget (if provided): {{Budget}}

Business Type (if provided): {{BusinessType}}

Company Size (QW Direct): {{CompanySize}}

Timeline: {{Timeline}}

Call Summary:

{{AgentGeneratedSummary}}`,
        },
        baseLogic: {
          greetingMessage: "",
          routingLogics: [],
        },
      });
    }
  }, [agent, open, availableVoices]);

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in agent name and description");
      return;
    }
    await onSave(formData);
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });
  };

  const removeFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index),
    });
  };

  const addIntent = () => {
    setFormData({
      ...formData,
      intents: [...formData.intents, { name: "", prompt: "" }],
    });
  };

  const removeIntent = (index: number) => {
    setFormData({
      ...formData,
      intents: formData.intents.filter((_, i) => i !== index),
    });
  };

  const addLeadField = () => {
    setFormData({
      ...formData,
      leadCapture: {
        ...formData.leadCapture,
        fields: [...formData.leadCapture.fields, { name: "", question: "", required: false, type: "text" }],
      },
    });
  };

  const removeLeadField = (index: number) => {
    setFormData({
      ...formData,
      leadCapture: {
        ...formData.leadCapture,
        fields: formData.leadCapture.fields.filter((_, i) => i !== index),
      },
    });
  };

  const addBusinessHour = () => {
    setFormData({
      ...formData,
      callRules: {
        ...formData.callRules,
        businessHours: {
          ...formData.callRules.businessHours,
          schedule: [...formData.callRules.businessHours.schedule, { day: "monday", start: "09:00", end: "17:00" }],
        },
      },
    });
  };

  const removeBusinessHour = (index: number) => {
    setFormData({
      ...formData,
      callRules: {
        ...formData.callRules,
        businessHours: {
          ...formData.callRules.businessHours,
          schedule: formData.callRules.businessHours.schedule.filter((_, i) => i !== index),
        },
      },
    });
  };


  const addRoutingLogic = () => {
    const newId = `routing-${Date.now()}`;
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        routingLogics: [...formData.baseLogic.routingLogics, {
          id: newId,
          name: `Routing Logic ${formData.baseLogic.routingLogics.length + 1}`,
          condition: "",
          action: "",
          response: "",
          informationGathering: [],
          leadCaptureFields: [],
          completionResponse: "",
        }],
      },
    });
  };

  const removeRoutingLogic = (id: string) => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        routingLogics: formData.baseLogic.routingLogics.filter((r) => r.id !== id),
      },
    });
  };

  const updateRoutingLogic = (id: string, updates: Partial<typeof formData.baseLogic.routingLogics[0]>, parentId?: string) => {
    const updateInArray = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
      return routings.map((r) => {
        if (r.id === id) {
          return { ...r, ...updates };
        }
        if (r.routingLogics && r.routingLogics.length > 0) {
          return { ...r, routingLogics: updateInArray(r.routingLogics as typeof formData.baseLogic.routingLogics) };
        }
        return r;
      });
    };

    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        routingLogics: updateInArray(formData.baseLogic.routingLogics),
      },
    });
  };

  const addNestedRoutingLogic = (parentId: string) => {
    const addToParent = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
      return routings.map((r) => {
        if (r.id === parentId) {
          const newId = `routing-${Date.now()}-${Math.random()}`;
          return {
            ...r,
            routingLogics: [
              ...(r.routingLogics || []),
              {
                id: newId,
                name: `Sub-Routing Logic ${(r.routingLogics?.length || 0) + 1}`,
                condition: "",
                action: "",
                response: "",
                informationGathering: [],
                leadCaptureFields: [],
                completionResponse: "",
              } as typeof formData.baseLogic.routingLogics[0],
            ],
          };
        }
        if (r.routingLogics && r.routingLogics.length > 0) {
          return { ...r, routingLogics: addToParent(r.routingLogics as typeof formData.baseLogic.routingLogics) };
        }
        return r;
      });
    };

    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        routingLogics: addToParent(formData.baseLogic.routingLogics),
      },
    });
  };

  const removeNestedRoutingLogic = (id: string, parentId: string) => {
    const removeFromParent = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
      return routings.map((r) => {
        if (r.id === parentId && r.routingLogics) {
          return {
            ...r,
            routingLogics: (r.routingLogics as typeof formData.baseLogic.routingLogics).filter((nr) => nr.id !== id),
          };
        }
        if (r.routingLogics && r.routingLogics.length > 0) {
          return { ...r, routingLogics: removeFromParent(r.routingLogics as typeof formData.baseLogic.routingLogics) };
        }
        return r;
      });
    };

    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        routingLogics: removeFromParent(formData.baseLogic.routingLogics),
      },
    });
  };

  // Recursive function to render routing logic at any depth
  const renderRoutingLogicRecursive = (
    routing: typeof formData.baseLogic.routingLogics[0],
    path: number[] = [],
    parentId?: string,
    depth: number = 0
  ) => {
    const tagNumber = path.length > 0 ? path.join('.') : String(path[0] + 1);
    const isOpen = depth === 0 
      ? openRoutingBlocks.has(routing.id)
      : openNestedRoutingBlocks.has(routing.id);
    
    const toggleOpen = () => {
      if (depth === 0) {
        toggleRoutingBlock(routing.id);
      } else {
        toggleNestedRoutingBlock(routing.id);
      }
    };

    const updateNestedRouting = (updates: any) => {
      if (parentId) {
        updateRoutingLogic(parentId, { routingLogics: updates });
      } else {
        updateRoutingLogic(routing.id, updates);
      }
    };

    const addNested = () => {
      const newId = `routing-${Date.now()}-${Math.random()}`;
      const newRouting = {
        id: newId,
        name: `Sub-Routing Logic ${((routing.routingLogics?.length || 0) + 1)}`,
        condition: "",
        action: "",
        response: "",
        informationGathering: [],
        leadCaptureFields: [],
        completionResponse: "",
        routingLogics: [],
      } as typeof formData.baseLogic.routingLogics[0];

      // Always add to the current routing's routingLogics, not the parent's
      // We need to find the current routing in the tree and update it
      const findAndAddToCurrent = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
        return routings.map((r) => {
          if (r.id === routing.id) {
            // Found the current routing, add to its routingLogics
            return {
              ...r,
              routingLogics: [...(r.routingLogics || []), newRouting],
            };
          }
          if (r.routingLogics && r.routingLogics.length > 0) {
            // Recursively search in nested routingLogics
            return { ...r, routingLogics: findAndAddToCurrent(r.routingLogics as typeof formData.baseLogic.routingLogics) };
          }
          return r;
        });
      };

      setFormData({
        ...formData,
        baseLogic: {
          ...formData.baseLogic,
          routingLogics: findAndAddToCurrent(formData.baseLogic.routingLogics),
        },
      });
    };

    const removeNested = (idToRemove: string) => {
      if (parentId) {
        removeNestedRoutingLogic(idToRemove, parentId);
      } else {
        removeNestedRoutingLogic(idToRemove, routing.id);
      }
    };

    // Progressive styling based on depth - more compact at deeper levels
    const bgColor = depth === 0 ? 'bg-muted/30' : depth === 1 ? 'bg-muted/20' : 'bg-muted/10';
    const padding = depth === 0 ? 'p-4' : depth === 1 ? 'p-3' : depth === 2 ? 'p-2.5' : 'p-2';
    // Reduced indentation - cap at ml-8 to prevent overflow
    const marginLeft = depth > 0 ? (depth === 1 ? 'ml-3' : depth === 2 ? 'ml-6' : 'ml-8') : '';
    const textSize = depth === 0 ? 'text-sm' : depth === 1 ? 'text-xs' : 'text-xs';
    const badgeSize = depth === 0 ? 'text-sm min-w-[2.5rem]' : depth === 1 ? 'text-xs min-w-[2rem]' : 'text-xs min-w-[1.75rem]';
    const badgeBg = depth === 0 ? 'bg-primary/20' : depth === 1 ? 'bg-primary/10' : 'bg-primary/5';
    const spaceY = depth === 0 ? 'space-y-4' : depth === 1 ? 'space-y-3' : 'space-y-2';
    const pt = depth === 0 ? 'pt-4' : depth === 1 ? 'pt-3' : 'pt-2';
    const pb = depth === 0 ? 'pb-3' : depth === 1 ? 'pb-2' : 'pb-1.5';
    const iconSize = depth === 0 ? 'h-4 w-4' : depth === 1 ? 'h-3 w-3' : 'h-2.5 w-2.5';
    const iconSizeSmall = depth === 0 ? 'h-3 w-3' : depth === 1 ? 'h-2.5 w-2.5' : 'h-2 w-2';
    const fieldPadding = depth === 0 ? 'p-3' : depth === 1 ? 'p-2' : 'p-1.5';
    const fieldBg = depth === 0 ? 'bg-secondary' : depth === 1 ? 'bg-secondary/50' : 'bg-secondary/30';
    const nestedSpacing = depth === 0 ? 'space-y-3' : depth === 1 ? 'space-y-2' : 'space-y-1.5';
    // Reduced nested margin - cap at ml-6 to prevent overflow
    const nestedMargin = depth === 1 ? 'ml-3 pl-3' : depth === 2 ? 'ml-6 pl-2' : 'ml-6 pl-2';
    const nestedBorder = depth > 0 ? (depth === 1 ? 'border-l-2 border-primary/20' : 'border-l-2 border-primary/10') : '';

    return (
      <Collapsible key={routing.id} open={isOpen} onOpenChange={toggleOpen}>
        <div className={cn(padding, bgColor, "rounded-lg border", marginLeft, depth > 0 && "space-y-3", "min-w-0", "flex-shrink-0")}>
          <CollapsibleTrigger className="w-full">
            <div className={cn("flex items-center justify-between border-b", pb, depth > 2 && "gap-1")}>
              <div className={cn("flex items-center gap-2", depth > 2 && "gap-1.5", "min-w-0 flex-1")}>
                <Badge variant="outline" className={cn(badgeBg, "text-primary border-primary/30 font-bold", badgeSize, "justify-center flex-shrink-0")}>
                  {tagNumber}
                </Badge>
                <Input
                  value={routing.name}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, name: e.target.value };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { name: e.target.value });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={depth === 0 ? "Routing Logic Name (e.g., Evolved Sound Route)" : "Nested Routing Logic Name"}
                  className={cn("font-semibold border-0 bg-transparent p-0 h-auto", textSize, "min-w-0 flex-1")}
                />
              </div>
              <div className={cn("flex items-center gap-2", depth > 2 && "gap-1", "flex-shrink-0")}>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (depth === 0) {
                      removeRoutingLogic(routing.id);
                    } else {
                      removeNested(routing.id);
                    }
                  }}
                >
                  <Trash2 className={iconSize} />
                </Button>
                {isOpen ? (
                  <ChevronUp className={cn(iconSize, "text-muted-foreground")} />
                ) : (
                  <ChevronDown className={cn(iconSize, "text-muted-foreground")} />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={cn(spaceY, pt)}>
            {/* Routing Rules */}
            <div className={cn("space-y-2", depth > 2 && "space-y-1.5")}>
              <h4 className={cn(textSize, "font-medium")}>Routing Rules</h4>
              <div className="space-y-1.5">
                <Label className={cn(textSize, "text-muted-foreground mb-1 block")}>Condition</Label>
                <Input
                  value={routing.condition}
                  onChange={(e) => {
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, condition: e.target.value };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { condition: e.target.value });
                    }
                  }}
                  placeholder='e.g., caller says "Evolved Sound"'
                  className={cn(textSize, depth > 2 && "h-8 text-xs")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn(textSize, "text-muted-foreground mb-1 block")}>Action</Label>
                <Input
                  value={routing.action}
                  onChange={(e) => {
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, action: e.target.value };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { action: e.target.value });
                    }
                  }}
                  placeholder='e.g., Route to Evolved Sound logic tree'
                  className={cn(textSize, depth > 2 && "h-8 text-xs")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn(textSize, "text-muted-foreground mb-1 block")}>Response</Label>
                <Textarea
                  value={routing.response}
                  onChange={(e) => {
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, response: e.target.value };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { response: e.target.value });
                    }
                  }}
                  placeholder='e.g., Thank you for choosing Evolved Sound. What type of service are you enquiring about?'
                  rows={depth > 2 ? 1 : 2}
                  className={cn(textSize, depth > 2 && "min-h-[2rem]")}
                />
              </div>
            </div>

            {/* Information Gathering */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <h5 className={cn(textSize, "font-medium")}>Information Gathering</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentInfo = routing.informationGathering || [];
                    const updated = [...currentInfo, { question: "" }];
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, informationGathering: updated };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { informationGathering: updated });
                    }
                  }}
                >
                  <Plus className={cn(iconSizeSmall, "mr-1")} />
                  Add
                </Button>
              </div>
              {(routing.informationGathering || []).map((item, infoIndex) => (
                <div key={infoIndex} className="flex gap-2">
                  <Input
                    value={item.question}
                    onChange={(e) => {
                      const currentInfo = routing.informationGathering || [];
                      const updated = [...currentInfo];
                      updated[infoIndex] = { question: e.target.value };
                      if (parentId) {
                        const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                          return routings.map((r) => {
                            if (r.id === routing.id) {
                              return { ...r, informationGathering: updated };
                            }
                            if (r.routingLogics && r.routingLogics.length > 0) {
                              return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                            }
                            return r;
                          });
                        };
                        setFormData({
                          ...formData,
                          baseLogic: {
                            ...formData.baseLogic,
                            routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                          },
                        });
                      } else {
                        updateRoutingLogic(routing.id, { informationGathering: updated });
                      }
                    }}
                    placeholder="Information question"
                    className={cn("flex-1", textSize)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const currentInfo = routing.informationGathering || [];
                      const updated = currentInfo.filter((_, i) => i !== infoIndex);
                      if (parentId) {
                        const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                          return routings.map((r) => {
                            if (r.id === routing.id) {
                              return { ...r, informationGathering: updated };
                            }
                            if (r.routingLogics && r.routingLogics.length > 0) {
                              return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                            }
                            return r;
                          });
                        };
                        setFormData({
                          ...formData,
                          baseLogic: {
                            ...formData.baseLogic,
                            routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                          },
                        });
                      } else {
                        updateRoutingLogic(routing.id, { informationGathering: updated });
                      }
                    }}
                  >
                    <X className={iconSizeSmall} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Lead Capture Fields */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <h5 className={cn(textSize, "font-medium")}>Lead Capture Fields</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFields = routing.leadCaptureFields || [];
                    const updated = [...currentFields, { name: "", question: "", required: false, type: "text" as const }];
                    if (parentId) {
                      const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                        return routings.map((r) => {
                          if (r.id === routing.id) {
                            return { ...r, leadCaptureFields: updated };
                          }
                          if (r.routingLogics && r.routingLogics.length > 0) {
                            return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                          }
                          return r;
                        });
                      };
                      setFormData({
                        ...formData,
                        baseLogic: {
                          ...formData.baseLogic,
                          routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                        },
                      });
                    } else {
                      updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                    }
                  }}
                >
                  <Plus className={cn(iconSizeSmall, "mr-1")} />
                  Add
                </Button>
              </div>
              {(routing.leadCaptureFields || []).map((field, fieldIndex) => (
                <div key={fieldIndex} className={cn(fieldPadding, fieldBg, "rounded space-y-1")}>
                  <div className="flex justify-between items-center">
                    <span className={cn(textSize, "font-medium")}>Field #{fieldIndex + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentFields = routing.leadCaptureFields || [];
                        const updated = currentFields.filter((_, i) => i !== fieldIndex);
                        if (parentId) {
                          const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                            return routings.map((r) => {
                              if (r.id === routing.id) {
                                return { ...r, leadCaptureFields: updated };
                              }
                              if (r.routingLogics && r.routingLogics.length > 0) {
                                return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                              }
                              return r;
                            });
                          };
                          setFormData({
                            ...formData,
                            baseLogic: {
                              ...formData.baseLogic,
                              routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                            },
                          });
                        } else {
                          updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                        }
                      }}
                    >
                      <X className={iconSizeSmall} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Input
                      value={field.name}
                      onChange={(e) => {
                        const currentFields = routing.leadCaptureFields || [];
                        const updated = [...currentFields];
                        updated[fieldIndex] = { ...updated[fieldIndex], name: e.target.value };
                        if (parentId) {
                          const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                            return routings.map((r) => {
                              if (r.id === routing.id) {
                                return { ...r, leadCaptureFields: updated };
                              }
                              if (r.routingLogics && r.routingLogics.length > 0) {
                                return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                              }
                              return r;
                            });
                          };
                          setFormData({
                            ...formData,
                            baseLogic: {
                              ...formData.baseLogic,
                              routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                            },
                          });
                        } else {
                          updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                        }
                      }}
                      placeholder="Field name"
                      className={textSize}
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value: "text" | "email" | "phone" | "number") => {
                        const currentFields = routing.leadCaptureFields || [];
                        const updated = [...currentFields];
                        updated[fieldIndex] = { ...updated[fieldIndex], type: value };
                        if (parentId) {
                          const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                            return routings.map((r) => {
                              if (r.id === routing.id) {
                                return { ...r, leadCaptureFields: updated };
                              }
                              if (r.routingLogics && r.routingLogics.length > 0) {
                                return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                              }
                              return r;
                            });
                          };
                          setFormData({
                            ...formData,
                            baseLogic: {
                              ...formData.baseLogic,
                              routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                            },
                          });
                        } else {
                          updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                        }
                      }}
                    >
                      <SelectTrigger className={cn(textSize, "h-7")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={field.question}
                    onChange={(e) => {
                      const currentFields = routing.leadCaptureFields || [];
                      const updated = [...currentFields];
                      updated[fieldIndex] = { ...updated[fieldIndex], question: e.target.value };
                      if (parentId) {
                        const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                          return routings.map((r) => {
                            if (r.id === routing.id) {
                              return { ...r, leadCaptureFields: updated };
                            }
                            if (r.routingLogics && r.routingLogics.length > 0) {
                              return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                            }
                            return r;
                          });
                        };
                        setFormData({
                          ...formData,
                          baseLogic: {
                            ...formData.baseLogic,
                            routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                          },
                        });
                      } else {
                        updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                      }
                    }}
                    placeholder="Question to ask"
                    className={textSize}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const currentFields = routing.leadCaptureFields || [];
                        const updated = [...currentFields];
                        updated[fieldIndex] = { ...updated[fieldIndex], required: e.target.checked };
                        if (parentId) {
                          const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                            return routings.map((r) => {
                              if (r.id === routing.id) {
                                return { ...r, leadCaptureFields: updated };
                              }
                              if (r.routingLogics && r.routingLogics.length > 0) {
                                return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                              }
                              return r;
                            });
                          };
                          setFormData({
                            ...formData,
                            baseLogic: {
                              ...formData.baseLogic,
                              routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                            },
                          });
                        } else {
                          updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                        }
                      }}
                      className="rounded"
                    />
                    <Label className={cn(textSize, "cursor-pointer")}>Required</Label>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Response */}
            <div className="pt-2 border-t space-y-2">
              <h5 className={cn(textSize, "font-medium")}>Completion Response</h5>
              <Textarea
                value={routing.completionResponse || ""}
                onChange={(e) => {
                  if (parentId) {
                    const findAndUpdate = (routings: typeof formData.baseLogic.routingLogics): typeof formData.baseLogic.routingLogics => {
                      return routings.map((r) => {
                        if (r.id === routing.id) {
                          return { ...r, completionResponse: e.target.value };
                        }
                        if (r.routingLogics && r.routingLogics.length > 0) {
                          return { ...r, routingLogics: findAndUpdate(r.routingLogics as typeof formData.baseLogic.routingLogics) };
                        }
                        return r;
                      });
                    };
                    setFormData({
                      ...formData,
                      baseLogic: {
                        ...formData.baseLogic,
                        routingLogics: findAndUpdate(formData.baseLogic.routingLogics),
                      },
                    });
                  } else {
                    updateRoutingLogic(routing.id, { completionResponse: e.target.value });
                  }
                }}
                placeholder="Response after collecting information"
                rows={2}
                className={textSize}
              />
            </div>

            {/* Recursive Nested Routing Logic */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <h5 className={cn(textSize, "font-medium")}>Nested Routing Logic</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNested}
                >
                  <Plus className={cn(iconSizeSmall, "mr-1")} />
                  Add Nested Routing
                </Button>
              </div>
              {routing.routingLogics && routing.routingLogics.length > 0 && (
                <div className={cn(nestedSpacing, nestedMargin, nestedBorder, "min-w-0", "flex-shrink-0")}>
                  {routing.routingLogics.map((nestedRouting, nestedIndex) => 
                    renderRoutingLogicRecursive(
                      nestedRouting,
                      [...path, nestedIndex + 1],
                      routing.id,
                      depth + 1
                    )
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  const addInformationGatheringQuestion = (routingId: string) => {
    updateRoutingLogic(routingId, {
      informationGathering: [
        ...formData.baseLogic.routingLogics.find((r) => r.id === routingId)?.informationGathering || [],
        { question: "" },
      ],
    });
  };

  const removeInformationGatheringQuestion = (routingId: string, index: number) => {
    const routing = formData.baseLogic.routingLogics.find((r) => r.id === routingId);
    if (routing) {
      updateRoutingLogic(routingId, {
        informationGathering: routing.informationGathering.filter((_, i) => i !== index),
      });
    }
  };

  const addLeadCaptureField = (routingId: string) => {
    updateRoutingLogic(routingId, {
      leadCaptureFields: [
        ...formData.baseLogic.routingLogics.find((r) => r.id === routingId)?.leadCaptureFields || [],
        { name: "", question: "", required: false, type: "text" as const },
      ],
    });
  };

  const removeLeadCaptureField = (routingId: string, index: number) => {
    const routing = formData.baseLogic.routingLogics.find((r) => r.id === routingId);
    if (routing) {
      updateRoutingLogic(routingId, {
        leadCaptureFields: routing.leadCaptureFields.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
      // Only allow closing via Cancel button, not by clicking outside or pressing ESC
      if (!open) {
        // Prevent closing - do nothing
        return;
      }
      onOpenChange(open);
    }}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        hideCloseButton={true}
        onEscapeKeyDown={(e) => {
          // Prevent closing on ESC key
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Prevent closing on outside interaction
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{agent ? "Edit Voice Agent" : "Create New Voice Agent"}</DialogTitle>
        </DialogHeader>

        {/* Show loading state if editing and agent data is not yet loaded */}
        {agent && !agent.id ? (
          <div className="py-8 text-center text-muted-foreground">Loading agent details...</div>
        ) : (
          /* Single Form - No Tabs */
          <div className="space-y-6">
            <div>
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sales Assistant"
              />
            </div>
            <div>
              <Label htmlFor="agent-description">Description *</Label>
              <Input
                id="agent-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Handles inbound sales inquiries"
              />
            </div>
            <div>
              <Label htmlFor="agent-system-prompt">System Prompt</Label>
              <Textarea
                id="agent-system-prompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Enter a custom system prompt that will be prepended to the agent's instructions. This allows you to set the overall tone, personality, and behavior guidelines for the agent."
                rows={4}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This system prompt will be added at the beginning of the agent's instructions. Use this to define the agent's personality, tone, and core behavior principles.
              </p>
            </div>
            <div>
              <Label htmlFor="agent-status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "busy") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Configuration */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Voice Configuration</h3>
              
              <div>
                <Label>Voice Type</Label>
                <Select
                  value={formData.voice.type}
                  onValueChange={(value: "generic" | "custom") => setFormData({
                    ...formData,
                    voice: { ...formData.voice, type: value },
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic Voice</SelectItem>
                    <SelectItem value="custom">Custom Cloned Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.voice.type === "generic" ? (
                <div>
                  <Label htmlFor="generic-voice">Select Generic Voice</Label>
                  <Select
                    value={formData.voice.genericVoice}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      voice: { ...formData.voice, genericVoice: value },
                    })}
                    disabled={voicesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={voicesLoading ? "Loading voices..." : "Select a voice"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.filter((voice: any) => voice.isAustralian).length > 0 ? (
                        availableVoices.filter((voice: any) => voice.isAustralian).map((voice) => (
                          <SelectItem key={voice.voice_id} value={voice.display_name}>
                            {voice.display_name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No Australian voices available</div>
                      )}
                    </SelectContent>
                  </Select>
                  {voicesLoading && (
                    <p className="text-xs text-muted-foreground mt-1">Loading voices from Retell...</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-voice-select">Select Custom Voice</Label>
                    <Select
                      value={formData.voice.customVoiceId || ""}
                      onValueChange={(value) => {
                        const selectedVoice = customVoices.find(v => v.voiceId === value);
                        setFormData({
                          ...formData,
                          voice: {
                            ...formData.voice,
                            customVoiceId: selectedVoice?.voiceId || "",
                            customVoiceUrl: selectedVoice?.url || "",
                          },
                        });
                      }}
                      disabled={customVoicesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={customVoicesLoading ? "Loading custom voices..." : "Select a custom voice"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customVoices.length > 0 ? (
                          customVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.voiceId}>
                              {voice.name} ({voice.type === "uploaded" ? "Uploaded" : "Recorded"})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No custom voices available</div>
                        )}
                      </SelectContent>
                    </Select>
                    {customVoicesLoading && (
                      <p className="text-xs text-muted-foreground mt-1">Loading custom voices...</p>
                    )}
                    {customVoices.length === 0 && !customVoicesLoading && (
                      <div className="mt-2 p-3 bg-secondary/50 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-2">
                          No custom voices available. Upload or record voices in Settings → Voice Settings.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            navigate("/settings?tab=voice");
                          }}
                        >
                          Go to Voice Settings
                        </Button>
                      </div>
                    )}
                    {formData.voice.customVoiceUrl && (() => {
                      // Construct full URL for audio playback
                      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
                      const audioUrl = formData.voice.customVoiceUrl.startsWith('http') 
                        ? formData.voice.customVoiceUrl 
                        : `${baseUrl}${formData.voice.customVoiceUrl}`;
                      return (
                        <div className="mt-2 p-2 bg-secondary rounded">
                          <p className="text-xs text-muted-foreground mb-2">Selected voice preview:</p>
                          <audio 
                            src={audioUrl} 
                            controls 
                            className="w-full"
                            preload="metadata"
                            onError={(e) => {
                              console.error('Audio playback error:', e, 'URL:', audioUrl);
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Sound Configuration */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Background Sound</h3>
              <p className="text-xs text-muted-foreground">
                Add ambient background sounds to create a more realistic call environment.
              </p>
              
              <div>
                <Label htmlFor="ambient-sound">Background Sound Type</Label>
                <Select
                  value={formData.ambientSound || "none"}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    ambientSound: value === "none" ? undefined : value as any,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background sound (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="call-center">Call Center</SelectItem>
                    <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
                    <SelectItem value="convention-hall">Convention Hall</SelectItem>
                    <SelectItem value="summer-outdoor">Summer Outdoor</SelectItem>
                    <SelectItem value="mountain-outdoor">Mountain Outdoor</SelectItem>
                    <SelectItem value="static-noise">Static Noise</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a background sound effect to enhance call realism
                </p>
              </div>

              {formData.ambientSound && (
                <div>
                  <Label htmlFor="ambient-sound-volume">
                    Background Sound Volume: {formData.ambientSoundVolume.toFixed(1)}
                  </Label>
                  <input
                    type="range"
                    id="ambient-sound-volume"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.ambientSoundVolume}
                    onChange={(e) => setFormData({
                      ...formData,
                      ambientSoundVolume: parseFloat(e.target.value),
                    })}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Quiet (0.0)</span>
                    <span>Normal (1.0)</span>
                    <span>Loud (2.0)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Adjust the volume of the background sound (0-2, default: 1.0)
                  </p>
                </div>
              )}
            </div>

            {/* Call Recording Configuration */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Call Recording</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="enable-recording" className="text-base">
                    Enable Call Recording
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, calls will be recorded and available for playback in call history. 
                    Recordings are useful for quality assurance, training, and compliance purposes.
                  </p>
                </div>
                <Switch
                  id="enable-recording"
                  checked={formData.enableRecording !== false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    enableRecording: checked,
                  })}
                />
              </div>
              {formData.enableRecording === false && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Call recording is disabled. No audio recordings will be saved for calls made with this agent.
                  </p>
                </div>
              )}
            </div>

            {/* Conversation Design Intake Form - Matching Mockup Flowchart */}
            <div className="pt-4 border-t space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-lg font-bold mb-2">Conversation Design Intake Form</h2>
                <p className="text-sm text-muted-foreground">Configure your voice agent following the structured flow</p>
              </div>

              {/* 1. Initial Logic / Greeting */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-sm">Initial Logic / Greeting</h3>
                    <p className="text-xs text-muted-foreground">The exact welcome script and routing menu options</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="greeting-message">Welcome Script & Routing Menu</Label>
                  <Textarea
                    id="greeting-message"
                    value={formData.baseLogic.greetingMessage}
                    onChange={(e) => setFormData({
                      ...formData,
                      baseLogic: { ...formData.baseLogic, greetingMessage: e.target.value },
                    })}
                    placeholder="Hello! Thank you for calling. This is the virtual assistant for Evolved Sound and QW Direct. To help you better, please say the name of the company you're trying to reach. You can say 'Evolved Sound' or 'QW Direct'."
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include the exact welcome message and routing options for callers to choose from
                  </p>
                </div>
              </div>

              {/* 1.5. Intent Definitions */}
              <Collapsible open={isIntentEditorOpen} onOpenChange={setIsIntentEditorOpen}>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1.5</div>
                        <div>
                          <h3 className="font-semibold text-sm">Intent Definitions</h3>
                          <p className="text-xs text-muted-foreground">Define intents that the agent will recognize during conversations</p>
                        </div>
                      </div>
                      {isIntentEditorOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <IntentEditor
                      intents={formData.intentDefinitions || []}
                      onIntentsChange={(intents) => setFormData({ ...formData, intentDefinitions: intents })}
                      availableRoutingActions={[]}
                      customRoutingActions={formData.customRoutingActions || []}
                      onCustomRoutingActionsChange={(actions) => setFormData({ ...formData, customRoutingActions: actions })}
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* 1.6. Field Schema Designer */}
              <Collapsible open={isFieldSchemaOpen} onOpenChange={setIsFieldSchemaOpen}>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1.6</div>
                        <div>
                          <h3 className="font-semibold text-sm">Field Schema</h3>
                          <p className="text-xs text-muted-foreground">Define data fields that the agent will collect during conversations</p>
                        </div>
                      </div>
                      {isFieldSchemaOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <FieldSchemaDesigner
                      fields={formData.fieldSchemas || []}
                      onFieldsChange={(fields) => setFormData({ ...formData, fieldSchemas: fields })}
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* 2. Routing Logic Blocks (Dynamic) */}
              <Collapsible open={isRoutingOpen} onOpenChange={setIsRoutingOpen}>
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border overflow-x-auto">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                        <div>
                          <h3 className="font-semibold text-sm">Routing Logic</h3>
                          <p className="text-xs text-muted-foreground">Define routing blocks with condition, action, response, and data collection</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              addRoutingLogic();
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Routing Logic
                          </Button>
                        </div>
                        {isRoutingOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4 min-w-0">

                {formData.baseLogic.routingLogics.length === 0 && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center mb-2">No routing logic blocks added yet.</p>
                    <p className="text-xs text-muted-foreground text-center">Click "Add Routing Logic" to create a routing block with condition, action, response, information gathering, and lead capture fields.</p>
                  </div>
                )}

                {formData.baseLogic.routingLogics.map((routing, routingIndex) => 
                  renderRoutingLogicRecursive(routing, [routingIndex + 1], undefined, 0)
                )}
                
                {/* Add Routing Logic Button at Bottom */}
                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      addRoutingLogic();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Routing Logic
                  </Button>
                </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* 3. Summary / Email Template */}
              <Collapsible open={isEmailTemplateOpen} onOpenChange={setIsEmailTemplateOpen}>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                        <div>
                          <h3 className="font-semibold text-sm">Summary / Email Template</h3>
                          <p className="text-xs text-muted-foreground">Email will be sent to client (caller) after call ends with exact information collected</p>
                        </div>
                      </div>
                      {isEmailTemplateOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      addRoutingLogic();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Routing Logic
                  </Button>
                </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* 3. Summary / Email Template */}
              <Collapsible open={isEmailTemplateOpen} onOpenChange={setIsEmailTemplateOpen}>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                        <div>
                          <h3 className="font-semibold text-sm">Summary / Email Template</h3>
                          <p className="text-xs text-muted-foreground">Email will be sent to client (caller) after call ends with exact information collected</p>
                        </div>
                      </div>
                      {isEmailTemplateOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs font-medium mb-1">Email Recipient:</p>
                    <p className="text-xs text-muted-foreground">
                      Email will be automatically sent to the caller's email address collected during the call (from Lead Capture Fields).
                    </p>
                  </div>
                  <div>
                    <Label>Email Subject Format</Label>
                    <Input
                      value={formData.emailTemplate?.subjectFormat || "New Inquiry - {{CompanyName}} - {{CallerName}}"}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailTemplate: { 
                          ...formData.emailTemplate || { subjectFormat: "", bodyTemplate: "" },
                          subjectFormat: e.target.value 
                        },
                      })}
                      placeholder="New Inquiry - {{CompanyName}} - {{CallerName}}"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {"{{FieldName}}"} to insert dynamic values (e.g., {"{{CompanyName}}"}, {"{{CallerName}}"})
                    </p>
                  </div>
                  <div>
                    <Label>Email Body Template</Label>
                    <Textarea
                      value={formData.emailTemplate?.bodyTemplate || `Company: {{CompanyName}}

Name: {{CallerName}}

Phone: {{PhoneNumber}}

Email: {{Email}}

Service Interested In: {{ServiceType}}

Budget (if provided): {{Budget}}

Business Type (if provided): {{BusinessType}}

Company Size (QW Direct): {{CompanySize}}

Timeline: {{Timeline}}

Call Summary:

{{AgentGeneratedSummary}}`}
                      onChange={(e) => setFormData({
                        ...formData,
                        emailTemplate: { 
                          ...formData.emailTemplate || { subjectFormat: "", bodyTemplate: "" },
                          bodyTemplate: e.target.value 
                        },
                      })}
                      placeholder="Company: {{CompanyName}}..."
                      rows={15}
                      className="mt-1 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {"{{FieldName}}"} placeholders. Available fields: CompanyName, CallerName, PhoneNumber, Email, ServiceType, Budget, BusinessType, CompanySize, Timeline, AgentGeneratedSummary
                    </p>
                  </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* 4. Fallback / Escalation Rules */}
              <Collapsible open={isFallbackOpen} onOpenChange={setIsFallbackOpen}>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                        <div>
                          <h3 className="font-semibold text-sm">Fallback / Escalation Rules</h3>
                          <p className="text-xs text-muted-foreground">What the agent should say/do if it cannot understand the caller</p>
                        </div>
                      </div>
                      {isFallbackOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-4">
                  <div>
                    <Label>First Attempt (Unclear Response)</Label>
                    <Textarea
                      value={formData.callRules.fallbackToVoicemail ? formData.callRules.voicemailMessage : "I didn't catch that. Could you repeat the name of the company you are calling?"}
                      onChange={(e) => setFormData({
                        ...formData,
                        callRules: {
                          ...formData.callRules,
                          voicemailMessage: e.target.value,
                        },
                      })}
                      placeholder="I didn't catch that. Could you repeat the name of the company you are calling?"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Second Attempt (Still Unclear)</Label>
                    <Textarea
                      value={formData.callRules.secondAttemptMessage || "I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?"}
                      onChange={(e) => setFormData({
                        ...formData,
                        callRules: {
                          ...formData.callRules,
                          secondAttemptMessage: e.target.value,
                        },
                      })}
                      placeholder="I'm sorry, I'm having trouble understanding you. Would you like to speak to a human representative instead?"
                      rows={2}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Message to say after 2 failed attempts to understand the caller
                    </p>
                  </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsConversationPreviewOpen(true)}
            disabled={!formData.baseLogic.greetingMessage}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Conversation
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.description || (agent && !agent.id)}>
              {isSaving ? "Saving..." : agent ? "Save Changes" : "Create Agent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Routing Preview Dialog */}
    <RoutingPreview
      open={isPreviewOpen}
      onOpenChange={setIsPreviewOpen}
      greetingMessage={formData.baseLogic.greetingMessage}
      routingLogics={formData.baseLogic.routingLogics}
    />

    {/* Conversation Preview Dialog */}
    <ConversationPreview
      open={isConversationPreviewOpen}
      onOpenChange={setIsConversationPreviewOpen}
      intents={formData.intentDefinitions || []}
      fields={formData.fieldSchemas || []}
      greetingMessage={formData.baseLogic.greetingMessage}
      routingLogics={formData.baseLogic.routingLogics}
    />
    </>
  );
}


