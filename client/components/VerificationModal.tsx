import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock } from "lucide-react";

export type VerificationType = "passcode" | "password" | "security-question";

interface VerificationModalProps {
  isOpen: boolean;
  type: VerificationType;
  title: string;
  message: string;
  passcode?: string; // For passcode verification
  question?: string; // For security question
  isLoading?: boolean;
  onVerify?: (answer: string) => void;
  onCancel?: () => void;
}

export const VerificationModal = ({
  isOpen,
  type,
  title,
  message,
  passcode,
  question,
  isLoading = false,
  onVerify,
  onCancel,
}: VerificationModalProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (!input.trim()) {
      setError("Please enter the required information");
      return;
    }

    // Validate based on type
    if (type === "passcode" && passcode && input !== passcode) {
      setError("Incorrect passcode");
      return;
    }

    // For password and security question, we just pass through to backend
    onVerify?.(input);
    setInput("");
  };

  const handleCancel = () => {
    setInput("");
    setError(null);
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-600" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning message */}
          <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This is a sensitive operation. Please verify your identity to
              continue.
            </p>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="verification-input">
              {type === "passcode" && "Enter Passcode"}
              {type === "password" && "Enter Password"}
              {type === "security-question" && "Answer"}
              {!["passcode", "password", "security-question"].includes(type) &&
                "Verify"}
            </Label>

            {type === "security-question" && question && (
              <p className="text-sm font-medium text-muted-foreground">
                {question}
              </p>
            )}

            <Input
              id="verification-input"
              type={type === "passcode" ? "password" : "text"}
              placeholder={
                type === "passcode"
                  ? "Enter your passcode"
                  : type === "password"
                    ? "Enter your password"
                    : "Enter your answer"
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null); // Clear error when user types
              }}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSubmit();
                }
              }}
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Debug mode - show passcode hint */}
          {process.env.NODE_ENV === "development" && type === "passcode" && passcode && (
            <p className="text-xs text-muted-foreground text-center border-t pt-2">
              Dev mode: Passcode is <code className="bg-muted px-1 py-0.5 rounded">{passcode}</code>
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="min-w-20"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;
