/**
 * Chat Message Processor
 * Handles the complete flow: message input → intent detection → operation execution → response generation
 */

import { ChatMessage as ChatMessageType, Intent } from "@/types/chat";
import { ContentItem, User } from "@/types/content";
import { detectIntent } from "./intentDetector";
import {
  executeChatOperation,
  ChatOperationContext,
  ChatOperationResult,
  generateResponseMessage,
  ModalState,
} from "./chatOperations";

export interface MessageProcessingContext {
  message: string;
  contentItems: ContentItem[];
  user: User | null;
}

export interface ProcessedMessage {
  userMessage: ChatMessageType;
  assistantMessage: ChatMessageType;
  intent: Intent;
  operationResult: ChatOperationResult;
  modalState?: ModalState;
}

/**
 * Process a user chat message and generate appropriate response
 * Returns user message, assistant response, and any required modal state
 */
export async function processChatMessage(
  context: MessageProcessingContext,
): Promise<ProcessedMessage> {
  const { message, contentItems, user } = context;

  // Create user message
  const userMessage: ChatMessageType = {
    id: `msg-${Date.now()}`,
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
    metadata: {
      characterCount: message.length,
      wordCount: message.split(/\s+/).length,
    },
  };

  // Detect intent from message
  const intent = detectIntent(message, contentItems);

  // Execute operation based on intent
  const operationResult = await executeChatOperation({
    intent,
    contentItems,
    user,
  });

  // Generate assistant response message
  const responseContent = generateResponseMessage(operationResult);

  const assistantMessage: ChatMessageType = {
    id: `msg-${Date.now()}-response`,
    role: "assistant",
    content: responseContent,
    timestamp: new Date().toISOString(),
    metadata: {
      intent: intent.type,
      operation: intent.operation,
      success: operationResult.success,
      requiresVerification: operationResult.requiresVerification || false,
      confidence: intent.confidence,
    },
  };

  return {
    userMessage,
    assistantMessage,
    intent,
    operationResult,
    modalState: operationResult.modalState,
  };
}

/**
 * Validate that a message is not empty and reasonable length
 */
export function validateMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || !message.trim()) {
    return {
      valid: false,
      error: "Message cannot be empty",
    };
  }

  if (message.length > 1000) {
    return {
      valid: false,
      error: "Message is too long (max 1000 characters)",
    };
  }

  return { valid: true };
}

/**
 * Format messages for display in chat UI
 */
export function formatChatMessage(message: ChatMessageType): string {
  return message.content;
}

/**
 * Check if message requires verification before execution
 */
export function requiresVerification(intent: Intent): boolean {
  return intent.requiresVerification;
}

/**
 * Get clarification question for ambiguous intents
 */
export function getClarificationQuestion(intent: Intent): string | null {
  return intent.clarificationNeeded || null;
}

/**
 * Generate suggestions for next actions based on last intent
 */
export function generateSuggestions(
  intent: Intent,
  contentItems: ContentItem[],
): string[] {
  const suggestions: string[] = [];

  switch (intent.type) {
    case "CREATE":
      suggestions.push("View my new content");
      suggestions.push("Share this content");
      suggestions.push("Add another content item");
      break;

    case "RETRIEVE":
      if (intent.parameters.itemId) {
        const item = contentItems.find((i) => i.id === intent.parameters.itemId);
        if (item) {
          suggestions.push(`Edit ${item.title}`);
          suggestions.push(`Share ${item.title}`);
          suggestions.push(`Delete ${item.title}`);
        }
      }
      break;

    case "UPDATE":
      suggestions.push("View the updated content");
      suggestions.push("Delete this content");
      suggestions.push("Share this content");
      break;

    case "DELETE":
      suggestions.push("View all my content");
      suggestions.push("Create new content");
      break;

    case "SHARE":
      suggestions.push("Generate a share link");
      suggestions.push("Protect with password");
      suggestions.push("View sharing settings");
      break;

    case "LIST":
      if (contentItems.length > 0) {
        suggestions.push("Search for specific content");
        suggestions.push("Filter by category");
        suggestions.push("Sort by date");
      }
      break;

    case "DUPLICATE":
      suggestions.push("View the duplicated content");
      suggestions.push("Share the copy");
      break;

    case "SEARCH":
      suggestions.push("Refine search results");
      suggestions.push("Filter by type");
      suggestions.push("View all content");
      break;

    default:
      suggestions.push("Create new content");
      suggestions.push("View my content");
      suggestions.push("Search content");
      break;
  }

  return suggestions;
}
