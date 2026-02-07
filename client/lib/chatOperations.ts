/**
 * Chat Operations Handler
 * Maps detected intents to actionable operations and modal states
 */

import { Intent, IntentType, ChatMessage as ChatMessageType } from "@/types/chat";
import { ContentItem } from "@/types/content";
import { User } from "@/types/content";

export interface ChatOperationContext {
  intent: Intent;
  contentItems: ContentItem[];
  user: User | null;
}

export interface ModalState {
  type: "content" | "share" | "delete" | null;
  isOpen: boolean;
  data?: Partial<ContentItem> | ContentItem | null;
}

export interface ChatOperationResult {
  success: boolean;
  message: string;
  modalState?: ModalState;
  resultData?: any;
  nextAction?: string;
  requiresVerification?: boolean;
}

/**
 * Execute a chat operation based on detected intent
 * Returns response message and any required modal state
 */
export async function executeChatOperation(
  context: ChatOperationContext,
): Promise<ChatOperationResult> {
  const { intent, contentItems, user } = context;

  // Check if clarification is needed
  if (intent.clarificationNeeded) {
    return {
      success: false,
      message: intent.clarificationNeeded,
      requiresVerification: false,
    };
  }

  // Route to specific operation handler
  switch (intent.type) {
    case "CREATE":
      return handleCreateIntent(intent, user);

    case "RETRIEVE":
      return handleRetrieveIntent(intent, contentItems, user);

    case "UPDATE":
      return handleUpdateIntent(intent, contentItems, user);

    case "DELETE":
      return handleDeleteIntent(intent, contentItems, user);

    case "SHARE":
      return handleShareIntent(intent, contentItems, user);

    case "PROTECT":
      return handleProtectIntent(intent, contentItems, user);

    case "LIST":
      return handleListIntent(intent, contentItems, user);

    case "DUPLICATE":
      return handleDuplicateIntent(intent, contentItems, user);

    case "SEARCH":
      return handleSearchIntent(intent, contentItems, user);

    case "UNKNOWN":
      return {
        success: false,
        message:
          "I didn't understand that request. You can create, view, edit, delete, or share content. What would you like to do?",
        requiresVerification: false,
      };

    default:
      return {
        success: false,
        message: "Operation not recognized",
        requiresVerification: false,
      };
  }
}

// ============ Intent Handlers ============

function handleCreateIntent(intent: Intent, user: User | null): ChatOperationResult {
  // Require authentication for create
  if (!user) {
    return {
      success: false,
      message:
        "You need to sign in to create content. Would you like to save locally instead?",
      requiresVerification: false,
    };
  }

  const { type, title, tags, category } = intent.parameters;

  return {
    success: true,
    message: `I'll help you create a new ${type || "content"} item${title ? ` titled "${title}"` : ""}. Please fill in the details.`,
    modalState: {
      type: "content",
      isOpen: true,
      data: {
        type: type || "text",
        title: title || "",
        tags: tags || [],
        category: category || null,
      },
    },
    requiresVerification: false,
  };
}

function handleRetrieveIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to view?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item.`,
      requiresVerification: false,
    };
  }

  return {
    success: true,
    message: `Here's the content: "${item.title}" (${item.type})`,
    resultData: item,
    requiresVerification: false,
  };
}

function handleUpdateIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId, title, tags, category } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to update?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item to update.`,
      requiresVerification: false,
    };
  }

  // Check ownership
  if (user && item.user_id !== user.id) {
    return {
      success: false,
      message: "You can only edit your own content.",
      requiresVerification: false,
    };
  }

  return {
    success: true,
    message: `I'll update "${item.title}" for you. Please modify the details as needed.`,
    modalState: {
      type: "content",
      isOpen: true,
      data: {
        ...item,
        ...(title && { title }),
        ...(tags && { tags }),
        ...(category && { category }),
      },
    },
    requiresVerification: false,
  };
}

function handleDeleteIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to delete?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item to delete.`,
      requiresVerification: false,
    };
  }

  // Check ownership
  if (user && item.user_id !== user.id) {
    return {
      success: false,
      message: "You can only delete your own content.",
      requiresVerification: false,
    };
  }

  return {
    success: true,
    message: `I'll delete "${item.title}". Please confirm this action.`,
    modalState: {
      type: "delete",
      isOpen: true,
      data: item,
    },
    requiresVerification: intent.requiresVerification,
  };
}

function handleShareIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId, is_public } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to share?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item to share.`,
      requiresVerification: false,
    };
  }

  // Check ownership
  if (user && item.user_id !== user.id) {
    return {
      success: false,
      message: "You can only share your own content.",
      requiresVerification: false,
    };
  }

  const action = is_public ? "share publicly" : "share with specific people";

  return {
    success: true,
    message: `I'll help you ${action} "${item.title}".`,
    modalState: {
      type: "share",
      isOpen: true,
      data: item,
    },
    requiresVerification: intent.requiresVerification,
  };
}

function handleProtectIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to protect?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item to protect.`,
      requiresVerification: false,
    };
  }

  // Check ownership
  if (user && item.user_id !== user.id) {
    return {
      success: false,
      message: "You can only protect your own content.",
      requiresVerification: false,
    };
  }

  return {
    success: true,
    message: `I'll set password protection on "${item.title}". You'll need to open the details to set the password.`,
    modalState: {
      type: "content",
      isOpen: true,
      data: item,
    },
    requiresVerification: intent.requiresVerification,
  };
}

function handleListIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { type, tags, category } = intent.parameters;

  // Filter content based on parameters
  let filtered = contentItems;

  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (tags && tags.length > 0) {
    filtered = filtered.filter((item) =>
      tags.some((tag) => item.tags?.includes(tag)),
    );
  }

  if (filtered.length === 0) {
    return {
      success: false,
      message: "No content items found matching those criteria.",
      requiresVerification: false,
    };
  }

  const list = filtered
    .slice(0, 5)
    .map((item) => `• ${item.title} (${item.type})`)
    .join("\n");

  const message =
    filtered.length > 5
      ? `Found ${filtered.length} items (showing first 5):\n${list}`
      : `Found ${filtered.length} items:\n${list}`;

  return {
    success: true,
    message,
    resultData: filtered.slice(0, 10),
    requiresVerification: false,
  };
}

function handleDuplicateIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { itemId } = intent.parameters;

  if (!itemId) {
    return {
      success: false,
      message: "Which content item would you like to duplicate?",
      requiresVerification: false,
    };
  }

  const item = contentItems.find((i) => i.id === itemId);
  if (!item) {
    return {
      success: false,
      message: `I couldn't find that content item to duplicate.`,
      requiresVerification: false,
    };
  }

  // Check ownership
  if (user && item.user_id !== user.id) {
    return {
      success: false,
      message: "You can only duplicate your own content.",
      requiresVerification: false,
    };
  }

  return {
    success: true,
    message: `I'll create a copy of "${item.title}". Duplicating...`,
    resultData: { sourceItemId: itemId },
    requiresVerification: false,
  };
}

function handleSearchIntent(
  intent: Intent,
  contentItems: ContentItem[],
  user: User | null,
): ChatOperationResult {
  const { query, type, tags, category } = intent.parameters;

  if (!query) {
    return {
      success: false,
      message: "What would you like to search for?",
      requiresVerification: false,
    };
  }

  // Filter content based on search query and parameters
  let filtered = contentItems.filter((item) => {
    const searchableText = `${item.title} ${item.category || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    return searchableText.includes(query.toLowerCase());
  });

  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (tags && tags.length > 0) {
    filtered = filtered.filter((item) =>
      tags.some((tag) => item.tags?.includes(tag)),
    );
  }

  if (filtered.length === 0) {
    return {
      success: false,
      message: `No content found matching "${query}".`,
      requiresVerification: false,
    };
  }

  const list = filtered
    .slice(0, 5)
    .map((item) => `• ${item.title} (${item.type})`)
    .join("\n");

  const message =
    filtered.length > 5
      ? `Found ${filtered.length} results for "${query}" (showing first 5):\n${list}`
      : `Found ${filtered.length} results for "${query}":\n${list}`;

  return {
    success: true,
    message,
    resultData: filtered.slice(0, 10),
    requiresVerification: false,
  };
}

/**
 * Generate a response message based on operation result
 */
export function generateResponseMessage(result: ChatOperationResult): string {
  if (!result.success && result.requiresVerification) {
    return `${result.message} Please verify this action.`;
  }
  return result.message;
}
