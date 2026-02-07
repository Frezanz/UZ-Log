import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FormField } from "@/types/chat";

interface ChatFormProps {
  fields: FormField[];
  onSubmit?: (values: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ChatForm = ({
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
}: ChatFormProps) => {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit?.(values);
  };

  return (
    <Card className="p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "textarea" ? (
              <Textarea
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
                className={errors[field.name] ? "border-red-500" : ""}
              />
            ) : field.type === "select" && field.options ? (
              <select
                name={field.name}
                value={values[field.name]}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors[field.name]
                    ? "border-red-500"
                    : "border-input bg-background"
                }`}
              >
                <option value="">Select {field.label.toLowerCase()}...</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={handleChange}
                disabled={isLoading}
                className={errors[field.name] ? "border-red-500" : ""}
              />
            )}

            {errors[field.name] && (
              <p className="text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-2 justify-end pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="min-w-20">
            {isLoading ? "..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatForm;
