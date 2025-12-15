import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Clock, Mail, Globe, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RoutingPreview } from "./RoutingPreview";
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
  
  // State for collapsible sections
  const [isGreetingOpen, setIsGreetingOpen] = useState(true);
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
    faqs: [] as Array<{ question: string; answer: string }>,
    intents: [] as Array<{ name: string; prompt: string; response?: string }>,
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
        faqs: [],
        intents: [],
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

              {/* 2. Routing Logic Blocks (Dynamic) */}
              <Collapsible open={isRoutingOpen} onOpenChange={setIsRoutingOpen}>
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
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
                  <CollapsibleContent className="space-y-4 pt-4">

                {formData.baseLogic.routingLogics.length === 0 && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center mb-2">No routing logic blocks added yet.</p>
                    <p className="text-xs text-muted-foreground text-center">Click "Add Routing Logic" to create a routing block with condition, action, response, information gathering, and lead capture fields.</p>
                  </div>
                )}

                {formData.baseLogic.routingLogics.map((routing, routingIndex) => {
                  const isBlockOpen = openRoutingBlocks.has(routing.id);
                  return (
                  <Collapsible key={routing.id} open={isBlockOpen} onOpenChange={() => toggleRoutingBlock(routing.id)}>
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              {routingIndex + 1}
                            </div>
                            <Input
                              value={routing.name}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateRoutingLogic(routing.id, { name: e.target.value });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Routing Logic Name (e.g., Evolved Sound Route)"
                              className="font-semibold border-0 bg-transparent p-0 h-auto"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRoutingLogic(routing.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {isBlockOpen ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        {/* Routing Rules: Condition, Action, Response */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Routing Rules</h4>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Condition (When this happens)</Label>
                        <Input
                          value={routing.condition}
                          onChange={(e) => updateRoutingLogic(routing.id, { condition: e.target.value })}
                          placeholder='e.g., caller says "Evolved Sound"'
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Action (What to do)</Label>
                        <Input
                          value={routing.action}
                          onChange={(e) => updateRoutingLogic(routing.id, { action: e.target.value })}
                          placeholder='e.g., Route to Evolved Sound logic tree'
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Response (What to say)</Label>
                        <Textarea
                          value={routing.response}
                          onChange={(e) => updateRoutingLogic(routing.id, { response: e.target.value })}
                          placeholder='e.g., Thank you for choosing Evolved Sound. What type of service are you enquiring about?'
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Information Gathering (Inside Routing Logic) */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Information Gathering</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => addInformationGatheringQuestion(routing.id)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Question
                        </Button>
                      </div>
                      {routing.informationGathering.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No information gathering questions added yet.</p>
                      )}
                      {routing.informationGathering.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item.question}
                            onChange={(e) => {
                              const updated = [...routing.informationGathering];
                              updated[index] = { question: e.target.value };
                              updateRoutingLogic(routing.id, { informationGathering: updated });
                            }}
                            placeholder='e.g., What type of service are you enquiring about?'
                            className="flex-1 text-xs"
                          />
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeInformationGatheringQuestion(routing.id, index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Nested Routing Logic */}
                    {routing.routingLogics && routing.routingLogics.length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Nested Routing Logic</h4>
                          <Button type="button" variant="outline" size="sm" onClick={() => addNestedRoutingLogic(routing.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Nested Routing
                          </Button>
                        </div>
                        <div className="ml-4 space-y-3 border-l-2 border-primary/20 pl-4">
                          {routing.routingLogics.map((nestedRouting, nestedIndex) => {
                            const isNestedOpen = openNestedRoutingBlocks.has(nestedRouting.id);
                            return (
                            <Collapsible key={nestedRouting.id} open={isNestedOpen} onOpenChange={() => toggleNestedRoutingBlock(nestedRouting.id)}>
                              <div className="p-4 bg-muted/20 rounded-lg border">
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-center justify-between pb-2 border-b">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-primary/30 text-primary flex items-center justify-center font-bold text-xs">
                                        {nestedIndex + 1}
                                      </div>
                                      <Input
                                        value={nestedRouting.name}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const updated = [...(routing.routingLogics || [])];
                                          updated[nestedIndex] = { ...updated[nestedIndex], name: e.target.value };
                                          updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Nested Routing Logic Name"
                                        className="font-semibold border-0 bg-transparent p-0 h-auto text-xs"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeNestedRoutingLogic(nestedRouting.id, routing.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                      {isNestedOpen ? (
                                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-3 pt-3">
                                  {/* Nested Routing Rules */}
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Condition</Label>
                                  <Input
                                    value={nestedRouting.condition}
                                    onChange={(e) => {
                                      const updated = [...(routing.routingLogics || [])];
                                      updated[nestedIndex] = { ...updated[nestedIndex], condition: e.target.value };
                                      updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                    }}
                                    placeholder='e.g., caller says "Voice Over"'
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Action</Label>
                                  <Input
                                    value={nestedRouting.action}
                                    onChange={(e) => {
                                      const updated = [...(routing.routingLogics || [])];
                                      updated[nestedIndex] = { ...updated[nestedIndex], action: e.target.value };
                                      updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                    }}
                                    placeholder='e.g., Route to Voice Over logic'
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1 block">Response</Label>
                                  <Textarea
                                    value={nestedRouting.response}
                                    onChange={(e) => {
                                      const updated = [...(routing.routingLogics || [])];
                                      updated[nestedIndex] = { ...updated[nestedIndex], response: e.target.value };
                                      updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                    }}
                                    placeholder='e.g., Great! What type of voice over project do you need?'
                                    rows={2}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                              {/* Nested Information Gathering */}
                              <div className="pt-2 border-t space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-medium">Information Gathering</h5>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updated = [...(routing.routingLogics || [])];
                                      const nested = { ...updated[nestedIndex] };
                                      nested.informationGathering = [...(nested.informationGathering || []), { question: "" }];
                                      updated[nestedIndex] = nested;
                                      updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                    }}
                                  >
                                    <Plus className="h-2 w-2 mr-1" />
                                    Add
                                  </Button>
                                </div>
                                {nestedRouting.informationGathering?.map((item, infoIndex) => (
                                  <div key={infoIndex} className="flex gap-2">
                                    <Input
                                      value={item.question}
                                      onChange={(e) => {
                                        const updated = [...(routing.routingLogics || [])];
                                        const nested = { ...updated[nestedIndex] };
                                        const infoUpdated = [...(nested.informationGathering || [])];
                                        infoUpdated[infoIndex] = { question: e.target.value };
                                        nested.informationGathering = infoUpdated;
                                        updated[nestedIndex] = nested;
                                        updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                      }}
                                      placeholder="Information question"
                                      className="flex-1 text-xs"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const updated = [...(routing.routingLogics || [])];
                                        const nested = { ...updated[nestedIndex] };
                                        nested.informationGathering = (nested.informationGathering || []).filter((_, i) => i !== infoIndex);
                                        updated[nestedIndex] = nested;
                                        updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                      }}
                                    >
                                      <X className="h-2 w-2" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              {/* Nested Lead Capture */}
                              <div className="pt-2 border-t space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-medium">Lead Capture Fields</h5>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updated = [...(routing.routingLogics || [])];
                                      const nested = { ...updated[nestedIndex] };
                                      nested.leadCaptureFields = [...(nested.leadCaptureFields || []), { name: "", question: "", required: false, type: "text" as const }];
                                      updated[nestedIndex] = nested;
                                      updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                    }}
                                  >
                                    <Plus className="h-2 w-2 mr-1" />
                                    Add
                                  </Button>
                                </div>
                                {nestedRouting.leadCaptureFields?.map((field, fieldIndex) => (
                                  <div key={fieldIndex} className="p-2 bg-secondary/50 rounded space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-medium">Field #{fieldIndex + 1}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updated = [...(routing.routingLogics || [])];
                                          const nested = { ...updated[nestedIndex] };
                                          nested.leadCaptureFields = (nested.leadCaptureFields || []).filter((_, i) => i !== fieldIndex);
                                          updated[nestedIndex] = nested;
                                          updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                        }}
                                      >
                                        <X className="h-2 w-2" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      <Input
                                        value={field.name}
                                        onChange={(e) => {
                                          const updated = [...(routing.routingLogics || [])];
                                          const nested = { ...updated[nestedIndex] };
                                          const fieldsUpdated = [...(nested.leadCaptureFields || [])];
                                          fieldsUpdated[fieldIndex] = { ...fieldsUpdated[fieldIndex], name: e.target.value };
                                          nested.leadCaptureFields = fieldsUpdated;
                                          updated[nestedIndex] = nested;
                                          updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                        }}
                                        placeholder="Field name"
                                        className="text-xs"
                                      />
                                      <Select
                                        value={field.type}
                                        onValueChange={(value: "text" | "email" | "phone" | "number") => {
                                          const updated = [...(routing.routingLogics || [])];
                                          const nested = { ...updated[nestedIndex] };
                                          const fieldsUpdated = [...(nested.leadCaptureFields || [])];
                                          fieldsUpdated[fieldIndex] = { ...fieldsUpdated[fieldIndex], type: value };
                                          nested.leadCaptureFields = fieldsUpdated;
                                          updated[nestedIndex] = nested;
                                          updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                        }}
                                      >
                                        <SelectTrigger className="text-xs h-7">
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
                                        const updated = [...(routing.routingLogics || [])];
                                        const nested = { ...updated[nestedIndex] };
                                        const fieldsUpdated = [...(nested.leadCaptureFields || [])];
                                        fieldsUpdated[fieldIndex] = { ...fieldsUpdated[fieldIndex], question: e.target.value };
                                        nested.leadCaptureFields = fieldsUpdated;
                                        updated[nestedIndex] = nested;
                                        updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                      }}
                                      placeholder="Question to ask"
                                      className="text-xs"
                                    />
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => {
                                          const updated = [...(routing.routingLogics || [])];
                                          const nested = { ...updated[nestedIndex] };
                                          const fieldsUpdated = [...(nested.leadCaptureFields || [])];
                                          fieldsUpdated[fieldIndex] = { ...fieldsUpdated[fieldIndex], required: e.target.checked };
                                          nested.leadCaptureFields = fieldsUpdated;
                                          updated[nestedIndex] = nested;
                                          updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                        }}
                                        className="rounded"
                                      />
                                      <Label className="text-xs cursor-pointer">Required</Label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Nested Completion Response */}
                              <div className="pt-2 border-t space-y-2">
                                <h5 className="text-xs font-medium">Completion Response</h5>
                                <Textarea
                                  value={nestedRouting.completionResponse || ""}
                                  onChange={(e) => {
                                    const updated = [...(routing.routingLogics || [])];
                                    const nested = { ...updated[nestedIndex] };
                                    nested.completionResponse = e.target.value;
                                    updated[nestedIndex] = nested;
                                    updateRoutingLogic(routing.id, { routingLogics: updated as any });
                                  }}
                                  placeholder="Response after collecting information"
                                  rows={2}
                                  className="text-xs"
                                />
                              </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add Nested Routing Logic Button */}
                    <div className="pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => addNestedRoutingLogic(routing.id)} className="w-full">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Nested Routing Logic
                      </Button>
                    </div>

                    {/* Lead Capture Fields (Inside Routing Logic) */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Lead Capture Fields</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => addLeadCaptureField(routing.id)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Field
                        </Button>
                      </div>
                      {routing.leadCaptureFields.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No lead capture fields added yet.</p>
                      )}
                      {routing.leadCaptureFields.map((field, index) => (
                        <div key={index} className="p-3 bg-secondary rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Field #{index + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeLeadCaptureField(routing.id, index)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={field.name}
                              onChange={(e) => {
                                const updated = [...routing.leadCaptureFields];
                                updated[index] = { ...updated[index], name: e.target.value };
                                updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                              }}
                              placeholder="Field name (e.g., fullName)"
                              className="text-xs"
                            />
                            <Select
                              value={field.type}
                              onValueChange={(value: "text" | "email" | "phone" | "number") => {
                                const updated = [...routing.leadCaptureFields];
                                updated[index] = { ...updated[index], type: value };
                                updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                              }}
                            >
                              <SelectTrigger className="text-xs">
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
                              const updated = [...routing.leadCaptureFields];
                              updated[index] = { ...updated[index], question: e.target.value };
                              updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                            }}
                            placeholder='Question to ask (e.g., What is your full name?)'
                            className="text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required-${routing.id}-${index}`}
                              checked={field.required}
                              onChange={(e) => {
                                const updated = [...routing.leadCaptureFields];
                                updated[index] = { ...updated[index], required: e.target.checked };
                                updateRoutingLogic(routing.id, { leadCaptureFields: updated });
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`required-${routing.id}-${index}`} className="text-xs cursor-pointer">
                              Required field
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
                })}
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

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.description || (agent && !agent.id)}>
            {isSaving ? "Saving..." : agent ? "Save Changes" : "Create Agent"}
          </Button>
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
    </>
  );
}


