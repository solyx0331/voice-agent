import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface FieldSchema {
  id: string;
  label: string;
  fieldName: string; // Internal field name (e.g., "email", "phoneNumber")
  dataType: "text" | "phone" | "email" | "number" | "choice" | "date" | "boolean";
  required: boolean;
  displayOrder: number;
  promptText?: string; // Question/prompt to ask for this field
  nlpExtractionHints?: string[]; // Keywords or patterns to help NLP extraction
  validationRules?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string; // Custom validation pattern
    errorMessage?: string;
  };
  choiceOptions?: string[]; // For "choice" data type
  defaultValue?: string;
  description?: string;
}

interface FieldSchemaDesignerProps {
  fields: FieldSchema[];
  onFieldsChange: (fields: FieldSchema[]) => void;
}

export function FieldSchemaDesigner({ fields, onFieldsChange }: FieldSchemaDesignerProps) {
  const [openFields, setOpenFields] = useState<Set<string>>(new Set());

  const toggleField = (fieldId: string) => {
    setOpenFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const addField = () => {
    const newField: FieldSchema = {
      id: `field_${Date.now()}`,
      label: "",
      fieldName: "",
      dataType: "text",
      required: false,
      displayOrder: fields.length,
    };
    onFieldsChange([...fields, newField]);
    setOpenFields(prev => new Set(prev).add(newField.id));
  };

  const removeField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const newFields = fields
      .filter(f => f.id !== fieldId)
      .map((f, index) => ({
        ...f,
        displayOrder: f.displayOrder > (field?.displayOrder || 0) ? f.displayOrder - 1 : f.displayOrder,
      }));
    onFieldsChange(newFields);
    setOpenFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldId);
      return newSet;
    });
  };

  const updateField = (fieldId: string, updates: Partial<FieldSchema>) => {
    onFieldsChange(
      fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const currentOrder = field.displayOrder;
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    const targetField = fields.find(f => f.displayOrder === newOrder);

    if (!targetField) return;

    const newFields = fields.map(f => {
      if (f.id === fieldId) return { ...f, displayOrder: newOrder };
      if (f.id === targetField.id) return { ...f, displayOrder: currentOrder };
      return f;
    });

    onFieldsChange(newFields.sort((a, b) => a.displayOrder - b.displayOrder));
  };

  const addChoiceOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const newOptions = [...(field.choiceOptions || []), ""];
    updateField(fieldId, { choiceOptions: newOptions });
  };

  const updateChoiceOption = (fieldId: string, index: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.choiceOptions) return;
    const newOptions = [...field.choiceOptions];
    newOptions[index] = value;
    updateField(fieldId, { choiceOptions: newOptions });
  };

  const removeChoiceOption = (fieldId: string, index: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.choiceOptions) return;
    const newOptions = field.choiceOptions.filter((_, i) => i !== index);
    updateField(fieldId, { choiceOptions: newOptions });
  };

  const addNlpHint = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const newHints = [...(field.nlpExtractionHints || []), ""];
    updateField(fieldId, { nlpExtractionHints: newHints });
  };

  const updateNlpHint = (fieldId: string, index: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.nlpExtractionHints) return;
    const newHints = [...field.nlpExtractionHints];
    newHints[index] = value;
    updateField(fieldId, { nlpExtractionHints: newHints });
  };

  const removeNlpHint = (fieldId: string, index: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.nlpExtractionHints) return;
    const newHints = field.nlpExtractionHints.filter((_, i) => i !== index);
    updateField(fieldId, { nlpExtractionHints: newHints });
  };

  const sortedFields = [...fields].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Field Schema</h3>
          <p className="text-sm text-muted-foreground">
            Define the data fields that the agent will collect during conversations. Fields can be required or optional, with custom validation rules.
          </p>
        </div>
        <Button type="button" onClick={addField} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No fields defined. Click "Add Field" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedFields.map((field, index) => (
            <Card key={field.id}>
              <Collapsible
                open={openFields.has(field.id)}
                onOpenChange={() => toggleField(field.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {openFields.has(field.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-base">
                              {field.label || "Unnamed Field"}
                              {field.required && (
                                <Badge variant="destructive" className="ml-2">Required</Badge>
                              )}
                              <Badge variant="outline" className="ml-2">{field.dataType}</Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {field.fieldName || "No field name"} • Order: {field.displayOrder + 1}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, "up");
                            }}
                          >
                            ↑
                          </Button>
                        )}
                        {index < sortedFields.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveField(field.id, "down");
                            }}
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
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
                        <Label htmlFor={`field-label-${field.id}`}>Field Label *</Label>
                        <Input
                          id={`field-label-${field.id}`}
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="e.g., Email Address"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`field-name-${field.id}`}>Field Name (Internal) *</Label>
                        <Input
                          id={`field-name-${field.id}`}
                          value={field.fieldName}
                          onChange={(e) => updateField(field.id, { fieldName: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                          placeholder="e.g., email_address"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Used internally. Use lowercase with underscores.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`field-type-${field.id}`}>Data Type *</Label>
                        <Select
                          value={field.dataType}
                          onValueChange={(value: FieldSchema["dataType"]) =>
                            updateField(field.id, { dataType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="phone">Phone Number</SelectItem>
                            <SelectItem value="email">Email Address</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="choice">Choice (Dropdown)</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between pt-6">
                        <Label htmlFor={`field-required-${field.id}`}>Required Field</Label>
                        <Switch
                          id={`field-required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                      </div>
                    </div>

                    {field.dataType === "choice" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Choice Options *</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addChoiceOption(field.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(field.choiceOptions || []).map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateChoiceOption(field.id, index, e.target.value)}
                                placeholder="Option value"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChoiceOption(field.id, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`field-prompt-${field.id}`}>Prompt Text</Label>
                      <Textarea
                        id={`field-prompt-${field.id}`}
                        value={field.promptText || ""}
                        onChange={(e) => updateField(field.id, { promptText: e.target.value })}
                        placeholder="e.g., What is your email address?"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The question the agent will ask to collect this field.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`field-description-${field.id}`}>Description (Optional)</Label>
                      <Textarea
                        id={`field-description-${field.id}`}
                        value={field.description || ""}
                        onChange={(e) => updateField(field.id, { description: e.target.value })}
                        placeholder="Internal notes about this field..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>NLP Extraction Hints</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addNlpHint(field.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Hint
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(field.nlpExtractionHints || []).map((hint, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={hint}
                              onChange={(e) => updateNlpHint(field.id, index, e.target.value)}
                              placeholder="e.g., email, contact email, e-mail"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNlpHint(field.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keywords or patterns to help the NLP system extract this field from user utterances.
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-base mb-3 block">Validation Rules</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {field.dataType === "text" && (
                          <>
                            <div>
                              <Label htmlFor={`field-minlength-${field.id}`}>Min Length</Label>
                              <Input
                                id={`field-minlength-${field.id}`}
                                type="number"
                                value={field.validationRules?.minLength || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    validationRules: {
                                      ...field.validationRules,
                                      minLength: e.target.value ? parseInt(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`field-maxlength-${field.id}`}>Max Length</Label>
                              <Input
                                id={`field-maxlength-${field.id}`}
                                type="number"
                                value={field.validationRules?.maxLength || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    validationRules: {
                                      ...field.validationRules,
                                      maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                          </>
                        )}
                        {field.dataType === "number" && (
                          <>
                            <div>
                              <Label htmlFor={`field-min-${field.id}`}>Min Value</Label>
                              <Input
                                id={`field-min-${field.id}`}
                                type="number"
                                value={field.validationRules?.min || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    validationRules: {
                                      ...field.validationRules,
                                      min: e.target.value ? parseFloat(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`field-max-${field.id}`}>Max Value</Label>
                              <Input
                                id={`field-max-${field.id}`}
                                type="number"
                                value={field.validationRules?.max || ""}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    validationRules: {
                                      ...field.validationRules,
                                      max: e.target.value ? parseFloat(e.target.value) : undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor={`field-pattern-${field.id}`}>Custom Regex Pattern</Label>
                        <Input
                          id={`field-pattern-${field.id}`}
                          value={field.validationRules?.pattern || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              validationRules: {
                                ...field.validationRules,
                                pattern: e.target.value || undefined,
                              },
                            })
                          }
                          placeholder="e.g., ^[A-Za-z0-9]+$"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional custom validation pattern. Leave empty to use default validation for the data type.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor={`field-error-${field.id}`}>Custom Error Message</Label>
                        <Input
                          id={`field-error-${field.id}`}
                          value={field.validationRules?.errorMessage || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              validationRules: {
                                ...field.validationRules,
                                errorMessage: e.target.value || undefined,
                              },
                            })
                          }
                          placeholder="e.g., Please enter a valid email address"
                        />
                      </div>
                    </div>
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

