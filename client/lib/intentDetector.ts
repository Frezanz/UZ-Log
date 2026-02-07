/**
 * Intent Detection System
 * Parses user messages and extracts intent, operation type, and parameters
 * Uses local pattern matching (no external API calls required)
 */

import { Intent, IntentType } from "@/types/chat";
import { ContentItem } from "@/types/content";
import {
  extractContentType,
  extractTitle,
  extractTags,
  extractCategory,
  extractVisibility,
  extractAutoDelete,
  calculateConfidence,
  getClarificationQuestion,
} from "./aiLocal";

/**
 * Main intent detection function
 * Analyzes user message and returns structured intent
 */
export function detectIntent(
  message: string,
  contentItems: ContentItem[] = [],
): Intent {
  const lower = message.toLowerCase();

  // Try to detect intent type by checking patterns in order of likelihood
  let detectedIntent: IntentType = "UNKNOWN";
  let confidence = 0;

  // Check for DELETE intent first (high priority - destructive)
  if (isDeleteIntent(lower)) {
    detectedIntent = "DELETE";
    confidence = calculateConfidence(message, "DELETE");
  }
  // Check for CREATE intent
  else if (isCreateIntent(lower)) {
    detectedIntent = "CREATE";
    confidence = calculateConfidence(message, "CREATE");
  }
  // Check for UPDATE intent
  else if (isUpdateIntent(lower)) {
    detectedIntent = "UPDATE";
    confidence = calculateConfidence(message, "UPDATE");
  }
  // Check for SHARE intent
  else if (isShareIntent(lower)) {
    detectedIntent = "SHARE";
    confidence = calculateConfidence(message, "SHARE");
  }
  // Check for PROTECT intent
  else if (isProtectIntent(lower)) {
    detectedIntent = "PROTECT";
    confidence = calculateConfidence(message, "PROTECT");
  }
  // Check for RETRIEVE intent
  else if (isRetrieveIntent(lower)) {
    detectedIntent = "RETRIEVE";
    confidence = calculateConfidence(message, "RETRIEVE");
  }
  // Check for LIST intent
  else if (isListIntent(lower)) {
    detectedIntent = "LIST";
    confidence = calculateConfidence(message, "LIST");
  }
  // Check for DUPLICATE intent
  else if (isDuplicateIntent(lower)) {
    detectedIntent = "DUPLICATE";
    confidence = calculateConfidence(message, "DUPLICATE");
  }
  // Check for SEARCH intent
  else if (isSearchIntent(lower)) {
    detectedIntent = "SEARCH";
    confidence = calculateConfidence(message, "SEARCH");
  }

  // Extract parameters based on detected intent
  const parameters = extractParameters(message, detectedIntent, contentItems);

  // Get clarification if needed
  const clarification = getClarification(message, detectedIntent, parameters);

  // Determine if verification is needed
  const requiresVerification = shouldRequireVerification(
    detectedIntent,
    parameters,
    contentItems,
  );

  return {
    type: detectedIntent,
    operation: intentToOperation(detectedIntent),
    parameters,
    requiresVerification,
    clarificationNeeded: clarification,
    confidence,
  };
}

// ============ Intent Detection Helpers ============

function isCreateIntent(lower: string): boolean {
  const createKeywords = [
    "create",
    "add",
    "new",
    "make",
    "write",
    "compose",
    "start",
    "insert",
    "post",
  ];
  return createKeywords.some((kw) => lower.includes(kw));
}

function isUpdateIntent(lower: string): boolean {
  const updateKeywords = [
    "update",
    "edit",
    "change",
    "modify",
    "revise",
    "alter",
    "adjust",
  ];
  return updateKeywords.some((kw) => lower.includes(kw));
}

function isDeleteIntent(lower: string): boolean {
  const deleteKeywords = [
    "delete",
    "remove",
    "erase",
    "destroy",
    "discard",
    "trash",
    "dump",
  ];
  return deleteKeywords.some((kw) => lower.includes(kw));
}

function isShareIntent(lower: string): boolean {
  const shareKeywords = [
    "share",
    "public",
    "publish",
    "make public",
    "post",
    "distribute",
  ];
  return shareKeywords.some((kw) => lower.includes(kw));
}

function isProtectIntent(lower: string): boolean {
  const protectKeywords = [
    "protect",
    "password",
    "secure",
    "lock",
    "private",
    "hide",
    "encrypt",
  ];
  return protectKeywords.some((kw) => lower.includes(kw));
}

function isRetrieveIntent(lower: string): boolean {
  const retrieveKeywords = [
    "show",
    "view",
    "get",
    "find",
    "open",
    "look",
    "display",
    "search for",
  ];
  return retrieveKeywords.some((kw) => lower.includes(kw));
}

function isListIntent(lower: string): boolean {
  const listKeywords = [
    "list",
    "all",
    "show all",
    "display all",
    "browse",
    "see all",
  ];
  return listKeywords.some((kw) => lower.includes(kw));
}

function isDuplicateIntent(lower: string): boolean {
  const duplicateKeywords = ["duplicate", "copy", "clone", "replicate"];
  return duplicateKeywords.some((kw) => lower.includes(kw));
}

function isSearchIntent(lower: string): boolean {
  const searchKeywords = [
    "search",
    "find",
    "filter",
    "look for",
    "query",
    "search for",
  ];
  return searchKeywords.some((kw) => lower.includes(kw));
}

// ============ Parameter Extraction ============

function extractParameters(
  message: string,
  intentType: IntentType,
  contentItems: ContentItem[],
): Record<string, any> {
  const params: Record<string, any> = {};

  // Extract common parameters
  const contentType = extractContentType(message);
  const title = extractTitle(message);
  const tags = extractTags(message);
  const category = extractCategory(message);
  const visibility = extractVisibility(message);
  const autoDelete = extractAutoDelete(message);

  // Add parameters based on intent type
  switch (intentType) {
    case "CREATE":
      params.type = contentType;
      params.title = title;
      params.tags = tags;
      params.category = category;
      params.is_public = visibility === "public" ? true : false;
      if (autoDelete) {
        params.auto_delete_enabled = true;
        if (autoDelete.days) {
          const deleteDate = new Date();
          deleteDate.setDate(deleteDate.getDate() + autoDelete.days);
          params.auto_delete_at = deleteDate.toISOString();
        }
      }
      break;

    case "UPDATE":
      // Look for item reference (by ID or title)
      const itemRef = findItemReference(message, contentItems);
      if (itemRef) {
        params.itemId = itemRef.id;
      }
      // Extract what to update
      if (title) params.title = title;
      if (tags.length > 0) params.tags = tags;
      if (category) params.category = category;
      if (visibility) params.is_public = visibility === "public";
      break;

    case "DELETE":
      const deleteRef = findItemReference(message, contentItems);
      if (deleteRef) {
        params.itemId = deleteRef.id;
      }
      break;

    case "RETRIEVE":
      const retrieveRef = findItemReference(message, contentItems);
      if (retrieveRef) {
        params.itemId = retrieveRef.id;
      }
      break;

    case "SHARE":
      const shareRef = findItemReference(message, contentItems);
      if (shareRef) {
        params.itemId = shareRef.id;
      }
      params.is_public = visibility === "private" ? false : true;
      break;

    case "PROTECT":
      const protectRef = findItemReference(message, contentItems);
      if (protectRef) {
        params.itemId = protectRef.id;
      }
      break;

    case "LIST":
      if (tags.length > 0) params.tags = tags;
      if (category) params.category = category;
      if (contentType) params.type = contentType;
      break;

    case "DUPLICATE":
      const dupRef = findItemReference(message, contentItems);
      if (dupRef) {
        params.itemId = dupRef.id;
      }
      break;
  }

  return params;
}

function findItemReference(
  message: string,
  contentItems: ContentItem[],
): ContentItem | null {
  // Look for ID references (starts with "item-", "local-", etc.)
  const idMatch = message.match(/(?:id|item)[\s:-]+([\w\-]+)/i);
  if (idMatch) {
    const item = contentItems.find((i) => i.id === idMatch[1]);
    if (item) return item;
  }

  // Look for quoted title
  const quotedMatch = message.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    const item = contentItems.find(
      (i) => i.title.toLowerCase() === quotedMatch[1].toLowerCase(),
    );
    if (item) return item;
  }

  // Look for title pattern "about X"
  const aboutMatch = message.match(
    /(?:about|called|named)\s+(.+?)(?:\s+(?:for|from)|$)/i,
  );
  if (aboutMatch) {
    const item = contentItems.find((i) =>
      i.title.toLowerCase().includes(aboutMatch[1].toLowerCase()),
    );
    if (item) return item;
  }

  return null;
}

// ============ Clarification Handling ============

function getClarification(
  message: string,
  intentType: IntentType,
  parameters: Record<string, any>,
): string | null {
  // CREATE requires content type
  if (intentType === "CREATE" && !parameters.type) {
    return getClarificationQuestion(message);
  }

  // CREATE requires title
  if (intentType === "CREATE" && !parameters.title) {
    return "What would you like to title this content?";
  }

  // DELETE/RETRIEVE/DUPLICATE require item reference
  if (
    ["DELETE", "RETRIEVE", "DUPLICATE"].includes(intentType) &&
    !parameters.itemId
  ) {
    return "Which content item would you like to work with? (You can use the title, ID, or describe it)";
  }

  // UPDATE requires item reference
  if (intentType === "UPDATE" && !parameters.itemId) {
    return "Which content item would you like to update?";
  }

  return null;
}

// ============ Verification Handling ============

function shouldRequireVerification(
  intentType: IntentType,
  parameters: Record<string, any>,
  contentItems: ContentItem[],
): boolean {
  // Always verify destructive operations
  if (intentType === "DELETE") {
    return true;
  }

  // Verify when changing visibility to public
  if (intentType === "SHARE" && parameters.is_public === true) {
    return true;
  }

  // Verify when setting protection
  if (intentType === "PROTECT") {
    return true;
  }

  return false;
}

// ============ Operation Mapping ============

function intentToOperation(intentType: IntentType): string {
  const operationMap: Record<IntentType, string> = {
    CREATE: "createContent",
    RETRIEVE: "viewContent",
    UPDATE: "updateContent",
    DELETE: "deleteContent",
    SHARE: "shareContent",
    PROTECT: "protectContent",
    LIST: "listContent",
    DUPLICATE: "duplicateContent",
    UNKNOWN: "unknown",
  };

  return operationMap[intentType];
}

// ============ Public Export ============

export function parseUserMessage(
  message: string,
  contentItems: ContentItem[] = [],
): Intent {
  return detectIntent(message, contentItems);
}
