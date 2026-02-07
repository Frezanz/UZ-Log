import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface OptionGroupProps {
  type: "radio" | "checkbox" | "chips";
  options: Option[];
  selected?: string | string[];
  onSelect?: (value: string | string[]) => void;
  multiple?: boolean;
  title?: string;
  description?: string;
  required?: boolean;
}

export const OptionGroup = ({
  type,
  options,
  selected,
  onSelect,
  multiple = false,
  title,
  description,
  required = false,
}: OptionGroupProps) => {
  const [selectedRadio, setSelectedRadio] = useState<string>(
    typeof selected === "string" ? selected : "",
  );
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Set<string>>(
    typeof selected === "string" ? new Set() : new Set(selected || []),
  );

  const handleRadioChange = (value: string) => {
    setSelectedRadio(value);
    onSelect?.(value);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newSelected = new Set(selectedCheckboxes);
    if (checked) {
      newSelected.add(value);
    } else {
      newSelected.delete(value);
    }
    setSelectedCheckboxes(newSelected);
    onSelect?.(Array.from(newSelected));
  };

  if (type === "radio") {
    return (
      <Card className="p-4 space-y-4">
        {title && (
          <div>
            <h3 className="font-semibold text-sm">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        <RadioGroup value={selectedRadio} onValueChange={handleRadioChange}>
          <div className="space-y-2">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`radio-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`radio-${option.value}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Card>
    );
  }

  if (type === "checkbox") {
    return (
      <Card className="p-4 space-y-4">
        {title && (
          <div>
            <h3 className="font-semibold text-sm">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={`checkbox-${option.value}`}
                checked={selectedCheckboxes.has(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(option.value, checked as boolean)
                }
                disabled={option.disabled}
              />
              <Label
                htmlFor={`checkbox-${option.value}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Chips/Button style
  return (
    <Card className="p-4 space-y-4">
      {title && (
        <div>
          <h3 className="font-semibold text-sm">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={
              selectedRadio === option.value ? "default" : "outline"
            }
            size="sm"
            onClick={() => {
              handleRadioChange(option.value);
            }}
            disabled={option.disabled}
            className="flex flex-col items-start h-auto py-2 px-3"
          >
            <span className="font-medium text-xs">{option.label}</span>
            {option.description && (
              <span className="text-xs opacity-70">{option.description}</span>
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default OptionGroup;
