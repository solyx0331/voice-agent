import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FieldSchema } from "./FieldSchemaDesigner";

interface FieldSchemaMapperProps {
  selectedFieldIds: string[]; // Array of field IDs from global fieldSchemas
  onSelectedFieldsChange: (fieldIds: string[]) => void;
  availableGlobalFields: FieldSchema[]; // Global fields to choose from
}

export function FieldSchemaMapper({ 
  selectedFieldIds, 
  onSelectedFieldsChange, 
  availableGlobalFields 
}: FieldSchemaMapperProps) {
  const [open, setOpen] = useState(false);

  // Get the actual field objects for selected IDs
  const selectedFields = availableGlobalFields.filter(f => selectedFieldIds.includes(f.id));

  // Get available fields that are not yet selected
  const availableFields = availableGlobalFields.filter(f => !selectedFieldIds.includes(f.id));

  const addField = (fieldId: string) => {
    onSelectedFieldsChange([...selectedFieldIds, fieldId]);
    setOpen(false);
  };

  const removeField = (fieldId: string) => {
    onSelectedFieldsChange(selectedFieldIds.filter(id => id !== fieldId));
  };

  if (availableGlobalFields.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">
          No global fields available. Please define fields in the "Field Schema" section (1.6) first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Fields Display */}
      {selectedFields.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Mapped Fields:</p>
          <div className="flex flex-wrap gap-2">
            {selectedFields.map((field) => (
              <Badge
                key={field.id}
                variant="secondary"
                className="px-3 py-1.5 flex items-center gap-2"
              >
                <span className="font-medium">{field.label || field.fieldName}</span>
                <span className="text-xs text-muted-foreground">
                  ({field.dataType} {field.required && "• Required"})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => removeField(field.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            No fields mapped. Click "Add Field" to select from global fields.
          </p>
        </div>
      )}

      {/* Add Field Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search fields..." />
            <CommandList>
              <CommandEmpty>No fields found.</CommandEmpty>
              <CommandGroup heading="Available Global Fields">
                {availableFields.map((field) => (
                  <CommandItem
                    key={field.id}
                    onSelect={() => addField(field.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{field.label || field.fieldName}</span>
                      <span className="text-xs text-muted-foreground">
                        {field.dataType} {field.required && "• Required"}
                        {field.description && ` • ${field.description}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {availableFields.length === 0 && (
                  <CommandItem disabled>All fields are already mapped</CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

