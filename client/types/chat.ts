export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string | null; // null for guests
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type IntentType =
  | "CREATE"
  | "RETRIEVE"
  | "UPDATE"
  | "DELETE"
  | "SHARE"
  | "PROTECT"
  | "LIST"
  | "SEARCH"
  | "DUPLICATE"
  | "UNKNOWN";

export type OperationType = string;

export interface Intent {
  type: IntentType;
  operation: OperationType;
  parameters: Record<string, any>;
  requiresVerification: boolean;
  clarificationNeeded: string | null;
  confidence: number; // 0-1 score for how confident the intent detection is
}

export interface VerificationRequest {
  type: "passcode" | "password" | "security-question";
  message: string;
  itemId?: string;
}

export interface VerificationResult {
  success: boolean;
  itemId?: string;
  verificationMethod?: string;
}

export interface ChatOption {
  value: string;
  label: string;
  description?: string;
}

export interface AssistantMessage {
  type: "text" | "options" | "form" | "error" | "success";
  content: string;
  options?: ChatOption[];
  formFields?: FormField[];
  nextAction?: {
    type: string;
    handler: string;
  };
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "password"
    | "email"
    | "url"
    | "number"
    | "select";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}
