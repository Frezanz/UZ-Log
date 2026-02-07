/**
 * Local AI utilities for intent detection, parameter extraction, and response formatting.
 * Runs entirely in the browser without external API calls.
 * Uses pattern matching and keyword analysis for intent recognition.
 */

import { ContentType } from "@/types/content";

// Content types for quick reference
const CONTENT_TYPES: ContentType[] = [
  "text",
  "code",
  "image",
  "video",
  "file",
  "link",
  "prompt",
  "script",
  "book",
];

// Pattern definitions for intent detection
const INTENT_PATTERNS = {
  CREATE: {
    keywords: ["create", "add", "new", "make", "insert", "write", "compose", "start"],
    phrases: [
      "new (text|code|image|video|file|link|prompt|script|book)",
      "create a?n? (text|code|image|video|file|link|prompt|script|book)",
      "add a?n? (text|code|image|video|file|link|prompt|script|book)",
    ],
  },
  RETRIEVE: {
    keywords: ["show", "view", "get", "find", "look", "search", "display", "open"],
    phrases: ["show me", "view", "get", "find", "search for"],
  },
  UPDATE: {
    keywords: ["update", "edit", "change", "modify", "revise", "alter", "adjust"],
    phrases: ["update", "edit", "modify", "change"],
  },
  DELETE: {
    keywords: ["delete", "remove", "erase", "destroy", "discard", "dump", "trash"],
    phrases: ["delete", "remove", "erase"],
  },
  SHARE: {
    keywords: ["share", "public", "publish", "make public", "post", "distribute"],
    phrases: ["share", "make public", "publish"],
  },
  PROTECT: {
    keywords: ["protect", "password", "secure", "lock", "private", "hide"],
    phrases: ["protect", "password", "secure", "private"],
  },
  LIST: {
    keywords: ["list", "all", "show all", "display all", "browse", "see all"],
    phrases: ["list all", "show all", "display all"],
  },
  DUPLICATE: {
    keywords: ["duplicate", "copy", "replicate", "clone", "reproduce"],
    phrases: ["duplicate", "copy", "clone"],
  },
};

/**
 * Extract content type from user message
 */
export function extractContentType(message: string): ContentType | null {
  const lower = message.toLowerCase();

  for (const type of CONTENT_TYPES) {
    if (lower.includes(type)) {
      return type;
    }
  }

  // Try some common aliases
  if (
    lower.includes("snippet") ||
    lower.includes("programming") ||
    lower.includes("python") ||
    lower.includes("javascript") ||
    lower.includes("java") ||
    lower.includes("typescript")
  ) {
    return "code";
  }

  if (lower.includes("url") || lower.includes("website") || lower.includes("web")) {
    return "link";
  }

  if (lower.includes("photo") || lower.includes("picture") || lower.includes("img")) {
    return "image";
  }

  if (lower.includes("movie") || lower.includes("clip") || lower.includes("stream")) {
    return "video";
  }

  return null;
}

/**
 * Extract title/name from message (usually after "about" or "called" or from quoted text)
 */
export function extractTitle(message: string): string | null {
  // Look for quoted text: "title" or 'title'
  const quotedMatch = message.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // Look for "about X" pattern
  const aboutMatch = message.match(/(?:about|called|named|title|name)\s+(.+?)(?:\s+for|\s+of|$)/i);
  if (aboutMatch) {
    return aboutMatch[1].trim();
  }

  // Look for "X for ..." pattern (usually title is before "for")
  const forMatch = message.match(/^(?:create|add|new)(?:\s+\w+)?\s+(.+?)\s+for/i);
  if (forMatch) {
    return forMatch[1].trim();
  }

  return null;
}

/**
 * Extract tags from message (comma-separated or after "tags:" or "#hashtag")
 */
export function extractTags(message: string): string[] {
  const tags: Set<string> = new Set();

  // Look for hashtags
  const hashtagMatches = message.match(/#[\w]+/g);
  if (hashtagMatches) {
    hashtagMatches.forEach((tag) => {
      tags.add(tag.substring(1).toLowerCase());
    });
  }

  // Look for "tags:" or "tag:" prefix
  const tagsMatch = message.match(/(?:tags?:)\s*(.+?)(?:\.|$|(?:for|by|in|at))/i);
  if (tagsMatch) {
    const tagList = tagsMatch[1]
      .split(/[,;]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    tagList.forEach((tag) => tags.add(tag));
  }

  return Array.from(tags);
}

/**
 * Extract category from message (usually after "in" or "under")
 */
export function extractCategory(message: string): string | null {
  // Look for "in category X" or "in X" patterns
  const inMatch = message.match(/in\s+(?:category\s+)?(.+?)(?:\s+(?:with|for|by)|$)/i);
  if (inMatch) {
    return inMatch[1].trim();
  }

  // Look for "under X" pattern
  const underMatch = message.match(/under\s+(.+?)(?:\s+(?:with|for|by)|$)/i);
  if (underMatch) {
    return underMatch[1].trim();
  }

  return null;
}

/**
 * Detect if message requires visibility settings (public/private)
 */
export function extractVisibility(
  message: string,
): "public" | "private" | null {
  const lower = message.toLowerCase();

  if (lower.includes("public")) {
    return "public";
  }

  if (lower.includes("private")) {
    return "private";
  }

  if (lower.includes("shared") || lower.includes("shareable")) {
    return "public";
  }

  return null;
}

/**
 * Detect if message mentions auto-delete or expiry
 */
export function extractAutoDelete(
  message: string,
): { enabled: boolean; days?: number } | null {
  const lower = message.toLowerCase();

  // Look for "delete after X days" or "expires in X days"
  const daysMatch = message.match(/(?:delete|expire)(?:\s+after|\s+in)\s+(\d+)\s+days?/i);
  if (daysMatch) {
    return { enabled: true, days: parseInt(daysMatch[1], 10) };
  }

  // Look for time patterns like "24 hours", "1 week"
  const timeMatch = message.match(
    /(?:delete|expire)(?:\s+after|\s+in)\s+(?:(\d+)\s+(?:hours?|days?|weeks?|months?))/i,
  );
  if (timeMatch) {
    return { enabled: true };
  }

  // Simple "auto delete" mention
  if (lower.includes("auto delete") || lower.includes("auto-delete")) {
    return { enabled: true };
  }

  return null;
}

/**
 * Check confidence of intent detection based on keyword strength
 */
export function calculateConfidence(message: string, intentType: string): number {
  const patterns = INTENT_PATTERNS[intentType as keyof typeof INTENT_PATTERNS];
  if (!patterns) return 0;

  const lower = message.toLowerCase();
  let confidence = 0;

  // Check keywords (0.3 points each)
  const keywordMatches = patterns.keywords.filter((kw) => lower.includes(kw)).length;
  confidence += (keywordMatches / patterns.keywords.length) * 0.3;

  // Check exact phrases (0.7 points)
  const hasPhrase = patterns.phrases.some((phrase) => {
    const regex = new RegExp(phrase, "i");
    return regex.test(message);
  });
  if (hasPhrase) {
    confidence += 0.7;
  }

  // Boost confidence if multiple relevant keywords are present
  if (keywordMatches > 1) {
    confidence = Math.min(1, confidence + 0.1);
  }

  return confidence;
}

/**
 * Determine if an operation requires verification based on sensitivity
 */
export function requiresVerification(
  intentType: string,
  parameters: Record<string, any>,
): boolean {
  const sensitiveIntents = ["DELETE", "PROTECT", "SHARE"];

  if (sensitiveIntents.includes(intentType)) {
    return true;
  }

  // Check if parameters involve sensitive changes
  if (parameters.is_public && intentType === "UPDATE") {
    return true;
  }

  return false;
}

export interface SuggestedAction {
  action: string;
  label: string;
  description: string;
}

/**
 * Generate next action suggestions based on completed operation
 */
export function suggestNextActions(
  intentType: string,
  operationSuccess: boolean,
): SuggestedAction[] {
  if (!operationSuccess) {
    return [
      {
        action: "retry",
        label: "Try Again",
        description: "Retry the last operation",
      },
      {
        action: "cancel",
        label: "Cancel",
        description: "Cancel and go back",
      },
    ];
  }

  const suggestions: { [key: string]: SuggestedAction[] } = {
    CREATE: [
      { action: "view", label: "View", description: "View the new content" },
      { action: "share", label: "Share", description: "Share this content" },
      { action: "add_more", label: "Add More", description: "Create another item" },
    ],
    RETRIEVE: [
      { action: "edit", label: "Edit", description: "Edit this content" },
      { action: "share", label: "Share", description: "Share this content" },
      { action: "delete", label: "Delete", description: "Delete this content" },
    ],
    DELETE: [
      { action: "undo", label: "Undo", description: "Undo the deletion" },
      { action: "list", label: "List All", description: "View all content" },
    ],
    SHARE: [
      { action: "copy", label: "Copy Link", description: "Copy the share link" },
      { action: "view", label: "View", description: "View the shared content" },
    ],
  };

  return suggestions[intentType] || [];
}

/**
 * Format assistant response message based on operation type
 */
export function formatAssistantMessage(
  intentType: string,
  success: boolean,
  details?: Record<string, any>,
): string {
  if (!success) {
    return (
      `I wasn't able to complete that operation. ${
        details?.error ? `Error: ${details.error}` : ""
      }`.trim() + " Please try again or provide more details."
    );
  }

  const messages: { [key: string]: string } = {
    CREATE: `✓ Content created successfully${
      details?.title ? ` as "${details.title}"` : ""
    }`,
    RETRIEVE: `Found: ${details?.title || "your content"}`,
    UPDATE: `✓ Updated successfully`,
    DELETE: `✓ Deleted successfully`,
    SHARE: `✓ Visibility updated${details?.is_public ? " (now public)" : " (now private)"}`,
    PROTECT: `✓ Protection settings updated`,
    LIST: `Found ${details?.count || 0} items`,
    DUPLICATE: `✓ Content duplicated as "${details?.title || "copy"}"`,
  };

  return messages[intentType] || "Operation completed successfully";
}

/**
 * Extract clarification needed from message
 */
export function getClarificationQuestion(
  message: string,
  suggestedType?: ContentType,
): string | null {
  const lower = message.toLowerCase();

  // If we don't know the type
  if (!suggestedType && !CONTENT_TYPES.some((t) => lower.includes(t))) {
    return "What type of content would you like to create? (text, code, image, video, file, link, prompt, script, or book)";
  }

  // If we need a title
  if (!extractTitle(message)) {
    return "What would you like to title this content?";
  }

  return null;
}
