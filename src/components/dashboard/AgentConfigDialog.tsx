import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Clock, Mail, Globe } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("basic");
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "inactive" as "active" | "inactive" | "busy",
    voice: {
      type: "generic" as "generic" | "custom",
      genericVoice: "ElevenLabs - Aria",
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
    baseLogic: {
      greetingMessage: "",
      primaryIntentPrompts: [] as string[],
      leadCaptureQuestions: [] as Array<{ question: string; field: string }>,
      responseLogic: [] as Array<{ condition: string; action: string; response: string }>,
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
          if (voices.length > 0 && !formData.voice.genericVoice) {
            setFormData(prev => ({
              ...prev,
              voice: {
                ...prev.voice,
                genericVoice: voices[0].display_name,
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
        status: agent.status || "inactive",
        voice: {
          type: agent.voice?.type || "generic",
          genericVoice: agent.voice?.genericVoice || (availableVoices.length > 0 ? availableVoices[0].display_name : "ElevenLabs - Aria"),
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
        baseLogic: {
          greetingMessage: agent.baseLogic?.greetingMessage || "",
          primaryIntentPrompts: agent.baseLogic?.primaryIntentPrompts || [],
          leadCaptureQuestions: agent.baseLogic?.leadCaptureQuestions || [],
          responseLogic: agent.baseLogic?.responseLogic || [],
        },
      });
    } else {
      // Reset form for new agent
      setFormData({
        name: "",
        description: "",
        status: "inactive",
        voice: {
          type: "generic",
          genericVoice: availableVoices.length > 0 ? availableVoices[0].display_name : "ElevenLabs - Aria",
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
        },
        leadCapture: { fields: [] },
        notifications: {
          email: "",
          crm: { type: "webhook", endpoint: "", apiKey: "" },
        },
        baseLogic: {
          greetingMessage: "",
          primaryIntentPrompts: [],
          leadCaptureQuestions: [],
          responseLogic: [],
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

  const addIntentPrompt = () => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        primaryIntentPrompts: [...formData.baseLogic.primaryIntentPrompts, ""],
      },
    });
  };

  const removeIntentPrompt = (index: number) => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        primaryIntentPrompts: formData.baseLogic.primaryIntentPrompts.filter((_, i) => i !== index),
      },
    });
  };

  const addLeadQuestion = () => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        leadCaptureQuestions: [...formData.baseLogic.leadCaptureQuestions, { question: "", field: "" }],
      },
    });
  };

  const removeLeadQuestion = (index: number) => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        leadCaptureQuestions: formData.baseLogic.leadCaptureQuestions.filter((_, i) => i !== index),
      },
    });
  };

  const addResponseLogic = () => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        responseLogic: [...formData.baseLogic.responseLogic, { condition: "", action: "", response: "" }],
      },
    });
  };

  const removeResponseLogic = (index: number) => {
    setFormData({
      ...formData,
      baseLogic: {
        ...formData.baseLogic,
        responseLogic: formData.baseLogic.responseLogic.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? "Edit Voice Agent" : "Create New Voice Agent"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs sm:text-sm">Voice</TabsTrigger>
            <TabsTrigger value="greeting" className="text-xs sm:text-sm">Greeting</TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs sm:text-sm">FAQs</TabsTrigger>
            <TabsTrigger value="rules" className="text-xs sm:text-sm">Call Rules</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
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

            {/* Base Receptionist Logic */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Base Receptionist Logic</h3>
              
              <div>
                <Label htmlFor="greeting-message">Greeting Message</Label>
                <Textarea
                  id="greeting-message"
                  value={formData.baseLogic.greetingMessage}
                  onChange={(e) => setFormData({
                    ...formData,
                    baseLogic: { ...formData.baseLogic, greetingMessage: e.target.value },
                  })}
                  placeholder="Hello! Thank you for calling. How can I assist you today?"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Primary Intent Prompts</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIntentPrompt}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.baseLogic.primaryIntentPrompts.map((prompt, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={prompt}
                      onChange={(e) => {
                        const newPrompts = [...formData.baseLogic.primaryIntentPrompts];
                        newPrompts[index] = e.target.value;
                        setFormData({
                          ...formData,
                          baseLogic: { ...formData.baseLogic, primaryIntentPrompts: newPrompts },
                        });
                      }}
                      placeholder="What can I help you with?"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeIntentPrompt(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Lead Capture Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLeadQuestion}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.baseLogic.leadCaptureQuestions.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item.question}
                      onChange={(e) => {
                        const newQuestions = [...formData.baseLogic.leadCaptureQuestions];
                        newQuestions[index] = { ...newQuestions[index], question: e.target.value };
                        setFormData({
                          ...formData,
                          baseLogic: { ...formData.baseLogic, leadCaptureQuestions: newQuestions },
                        });
                      }}
                      placeholder="What's your name?"
                      className="flex-1"
                    />
                    <Input
                      value={item.field}
                      onChange={(e) => {
                        const newQuestions = [...formData.baseLogic.leadCaptureQuestions];
                        newQuestions[index] = { ...newQuestions[index], field: e.target.value };
                        setFormData({
                          ...formData,
                          baseLogic: { ...formData.baseLogic, leadCaptureQuestions: newQuestions },
                        });
                      }}
                      placeholder="name"
                      className="w-24"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLeadQuestion(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Response Logic (Advanced)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addResponseLogic}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                </div>
                {formData.baseLogic.responseLogic.map((rule, index) => (
                  <div key={index} className="p-3 bg-secondary rounded-lg mb-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={rule.condition}
                        onChange={(e) => {
                          const newLogic = [...formData.baseLogic.responseLogic];
                          newLogic[index] = { ...newLogic[index], condition: e.target.value };
                          setFormData({
                            ...formData,
                            baseLogic: { ...formData.baseLogic, responseLogic: newLogic },
                          });
                        }}
                        placeholder="If booking appointment"
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeResponseLogic(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={rule.action}
                      onChange={(e) => {
                        const newLogic = [...formData.baseLogic.responseLogic];
                        newLogic[index] = { ...newLogic[index], action: e.target.value };
                        setFormData({
                          ...formData,
                          baseLogic: { ...formData.baseLogic, responseLogic: newLogic },
                        });
                      }}
                      placeholder="Action (e.g., ask for date)"
                    />
                    <Textarea
                      value={rule.response}
                      onChange={(e) => {
                        const newLogic = [...formData.baseLogic.responseLogic];
                        newLogic[index] = { ...newLogic[index], response: e.target.value };
                        setFormData({
                          ...formData,
                          baseLogic: { ...formData.baseLogic, responseLogic: newLogic },
                        });
                      }}
                      placeholder="Response text"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-4">
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
                    {availableVoices.length > 0 ? (
                      availableVoices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.display_name}>
                          {voice.display_name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No voices available</div>
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
                  {formData.voice.customVoiceUrl && (
                    <div className="mt-2 p-2 bg-secondary rounded">
                      <p className="text-xs text-muted-foreground mb-2">Selected voice preview:</p>
                      <audio src={formData.voice.customVoiceUrl} controls className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Greeting Tab */}
          <TabsContent value="greeting" className="space-y-4">
            <div>
              <Label htmlFor="greeting-script">Greeting Script</Label>
              <Textarea
                id="greeting-script"
                value={formData.greetingScript}
                onChange={(e) => setFormData({ ...formData, greetingScript: e.target.value })}
                placeholder="Hello! Thank you for calling [Company Name]. This is [Agent Name]. How can I assist you today?"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the initial message the AI will say when answering calls.
              </p>
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Frequently Asked Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFAQ}>
                <Plus className="h-4 w-4 mr-1" />
                Add FAQ
              </Button>
            </div>
            {formData.faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-secondary rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FAQ #{index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFAQ(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) => {
                    const newFAQs = [...formData.faqs];
                    newFAQs[index] = { ...newFAQs[index], question: e.target.value };
                    setFormData({ ...formData, faqs: newFAQs });
                  }}
                  placeholder="Question"
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFAQs = [...formData.faqs];
                    newFAQs[index] = { ...newFAQs[index], answer: e.target.value };
                    setFormData({ ...formData, faqs: newFAQs });
                  }}
                  placeholder="Answer"
                  rows={3}
                />
              </div>
            ))}
            {formData.faqs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No FAQs added yet. Click "Add FAQ" to get started.</p>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <Label>Intents</Label>
                <Button type="button" variant="outline" size="sm" onClick={addIntent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Intent
                </Button>
              </div>
              {formData.intents.map((intent, index) => (
                <div key={index} className="p-4 bg-secondary rounded-lg space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Intent #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeIntent(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={intent.name}
                    onChange={(e) => {
                      const newIntents = [...formData.intents];
                      newIntents[index] = { ...newIntents[index], name: e.target.value };
                      setFormData({ ...formData, intents: newIntents });
                    }}
                    placeholder="Intent name (e.g., 'booking', 'support')"
                  />
                  <Textarea
                    value={intent.prompt}
                    onChange={(e) => {
                      const newIntents = [...formData.intents];
                      newIntents[index] = { ...newIntents[index], prompt: e.target.value };
                      setFormData({ ...formData, intents: newIntents });
                    }}
                    placeholder="Prompt (e.g., 'Are you booking an appointment?')"
                    rows={2}
                  />
                  <Textarea
                    value={intent.response || ""}
                    onChange={(e) => {
                      const newIntents = [...formData.intents];
                      newIntents[index] = { ...newIntents[index], response: e.target.value };
                      setFormData({ ...formData, intents: newIntents });
                    }}
                    placeholder="Response (optional)"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Call Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Business Hours</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.callRules.businessHours.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      callRules: {
                        ...formData.callRules,
                        businessHours: {
                          ...formData.callRules.businessHours,
                          enabled: e.target.checked,
                        },
                      },
                    })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Enable business hours</span>
                </div>
              </div>

              {formData.callRules.businessHours.enabled && (
                <>
                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={formData.callRules.businessHours.timezone}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        callRules: {
                          ...formData.callRules,
                          businessHours: {
                            ...formData.callRules.businessHours,
                            timezone: value,
                          },
                        },
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</SelectItem>
                        <SelectItem value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</SelectItem>
                        <SelectItem value="UTC+0 (London)">UTC+0 (London)</SelectItem>
                        <SelectItem value="UTC+1 (Paris)">UTC+1 (Paris)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Schedule</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addBusinessHour}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Day
                      </Button>
                    </div>
                    {formData.callRules.businessHours.schedule.map((schedule, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Select
                          value={schedule.day}
                          onValueChange={(value) => {
                            const newSchedule = [...formData.callRules.businessHours.schedule];
                            newSchedule[index] = { ...newSchedule[index], day: value };
                            setFormData({
                              ...formData,
                              callRules: {
                                ...formData.callRules,
                                businessHours: {
                                  ...formData.callRules.businessHours,
                                  schedule: newSchedule,
                                },
                              },
                            });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => {
                            const newSchedule = [...formData.callRules.businessHours.schedule];
                            newSchedule[index] = { ...newSchedule[index], start: e.target.value };
                            setFormData({
                              ...formData,
                              callRules: {
                                ...formData.callRules,
                                businessHours: {
                                  ...formData.callRules.businessHours,
                                  schedule: newSchedule,
                                },
                              },
                            });
                          }}
                          className="w-32"
                        />
                        <span className="self-center">to</span>
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => {
                            const newSchedule = [...formData.callRules.businessHours.schedule];
                            newSchedule[index] = { ...newSchedule[index], end: e.target.value };
                            setFormData({
                              ...formData,
                              callRules: {
                                ...formData.callRules,
                                businessHours: {
                                  ...formData.callRules.businessHours,
                                  schedule: newSchedule,
                                },
                              },
                            });
                          }}
                          className="w-32"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeBusinessHour(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.callRules.fallbackToVoicemail}
                    onChange={(e) => setFormData({
                      ...formData,
                      callRules: {
                        ...formData.callRules,
                        fallbackToVoicemail: e.target.checked,
                      },
                    })}
                    className="h-4 w-4"
                  />
                  <Label>Fallback to Voicemail</Label>
                </div>
                {formData.callRules.fallbackToVoicemail && (
                  <Textarea
                    value={formData.callRules.voicemailMessage || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      callRules: {
                        ...formData.callRules,
                        voicemailMessage: e.target.value,
                      },
                    })}
                    placeholder="Voicemail message"
                    rows={3}
                  />
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label>Lead Capture Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLeadField}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
                {formData.leadCapture.fields.map((field, index) => (
                  <div key={index} className="p-3 bg-secondary rounded-lg mb-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={field.name}
                        onChange={(e) => {
                          const newFields = [...formData.leadCapture.fields];
                          newFields[index] = { ...newFields[index], name: e.target.value };
                          setFormData({
                            ...formData,
                            leadCapture: { ...formData.leadCapture, fields: newFields },
                          });
                        }}
                        placeholder="Field name (e.g., 'name', 'email')"
                        className="flex-1"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value: "text" | "email" | "phone" | "number") => {
                          const newFields = [...formData.leadCapture.fields];
                          newFields[index] = { ...newFields[index], type: value };
                          setFormData({
                            ...formData,
                            leadCapture: { ...formData.leadCapture, fields: newFields },
                          });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLeadField(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={field.question}
                      onChange={(e) => {
                        const newFields = [...formData.leadCapture.fields];
                        newFields[index] = { ...newFields[index], question: e.target.value };
                        setFormData({
                          ...formData,
                          leadCapture: { ...formData.leadCapture, fields: newFields },
                        });
                      }}
                      placeholder="Question to ask (e.g., 'What's your name?')"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const newFields = [...formData.leadCapture.fields];
                          newFields[index] = { ...newFields[index], required: e.target.checked };
                          setFormData({
                            ...formData,
                            leadCapture: { ...formData.leadCapture, fields: newFields },
                          });
                        }}
                        className="h-4 w-4"
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div>
              <Label htmlFor="notification-email">
                <Mail className="h-4 w-4 inline mr-2" />
                Notification Email
              </Label>
              <Input
                id="notification-email"
                type="email"
                value={formData.notifications.email}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, email: e.target.value },
                })}
                placeholder="admin@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email address to receive notifications about leads and calls
              </p>
            </div>

            <div className="pt-4 border-t">
              <Label>
                <Globe className="h-4 w-4 inline mr-2" />
                CRM Integration
              </Label>
              <Select
                value={formData.notifications.crm.type}
                onValueChange={(value: "webhook" | "salesforce" | "hubspot" | "zapier") => setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    crm: { ...formData.notifications.crm, type: value },
                  },
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="zapier">Zapier</SelectItem>
                </SelectContent>
              </Select>

              {formData.notifications.crm.type === "webhook" && (
                <div className="mt-2 space-y-2">
                  <Input
                    value={formData.notifications.crm.endpoint || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        crm: { ...formData.notifications.crm, endpoint: e.target.value },
                      },
                    })}
                    placeholder="Webhook URL"
                  />
                  <Input
                    type="password"
                    value={formData.notifications.crm.apiKey || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        crm: { ...formData.notifications.crm, apiKey: e.target.value },
                      },
                    })}
                    placeholder="API Key (optional)"
                  />
                </div>
              )}

              {(formData.notifications.crm.type === "salesforce" || 
                formData.notifications.crm.type === "hubspot" || 
                formData.notifications.crm.type === "zapier") && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="password"
                    value={formData.notifications.crm.apiKey || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        crm: { ...formData.notifications.crm, apiKey: e.target.value },
                      },
                    })}
                    placeholder="API Key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Connect your {formData.notifications.crm.type} account to automatically sync leads
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.description}>
            {isSaving ? "Saving..." : agent ? "Save Changes" : "Create Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

