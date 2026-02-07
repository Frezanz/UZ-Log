/**
 * Chat Response Formatter
 * Formats assistant messages based on operation results
 * Provides structured responses with options and next actions
 */

import { AssistantMessage, ChatOption } from "@/types/chat";
import { ContentType } from "@/types/content";
import { IntentType } from "@/types/chat";
import { formatAssistantMessage, suggestNextActions } from "./aiLocal";

/**
 * Format response after successful content creation
 */
export function formatCreateResponse(
  contentType: ContentType,
  title: string,
  itemId: string,
): AssistantMessage {
  const nextActions = suggestNextActions("CREATE", true);

  return {
    type: "success",
    content: `✓ Created ${contentType}: "${title}"`,
    options: nextActions.map((action) => ({
      value: action.action,
      label: action.label,
      description: action.description,
    })),
  };
}

/**
 * Format response after retrieving content
 */
export function formatRetrieveResponse(
  title: string,
  itemId: string,
): AssistantMessage {
  return {
    type: "text",
    content: `Retrieved: ${title}. What would you like to do next?`,
    options: [
      {
        value: "view",
        label: "View Full Content",
        description: "See the complete content",
      },
      {
        value: "edit",
        label: "Edit",
        description: "Make changes to this content",
      },
      {
        value: "share",
        label: "Share",
        description: "Share this with others",
      },
      {
        value: "delete",
        label: "Delete",
        description: "Remove this content",
      },
    ],
  };
}

/**
 * Format response after updating content
 */
export function formatUpdateResponse(title: string): AssistantMessage {
  return {
    type: "success",
    content: `✓ Updated "${title}"`,
    options: [
      {
        value: "view",
        label: "View Changes",
        description: "See the updated content",
      },
      {
        value: "add_more",
        label: "Update More",
        description: "Update another item",
      },
    ],
  };
}

/**
 * Format response after deleting content
 */
export function formatDeleteResponse(title: string): AssistantMessage {
  return {
    type: "success",
    content: `✓ Deleted "${title}"`,
    options: [
      {
        value: "undo",
        label: "Undo Deletion",
        description: "Restore this content",
      },
      {
        value: "list",
        label: "View All Content",
        description: "See your remaining content",
      },
    ],
  };
}

/**
 * Format response after sharing content
 */
export function formatShareResponse(
  title: string,
  isPublic: boolean,
): AssistantMessage {
  return {
    type: "success",
    content: `✓ "${title}" is now ${isPublic ? "public" : "private"}`,
    options: isPublic
      ? [
          {
            value: "copy",
            label: "Copy Link",
            description: "Copy the public link",
          },
          {
            value: "protect",
            label: "Protect",
            description: "Add password protection",
          },
        ]
      : [
          {
            value: "make_public",
            label: "Make Public",
            description: "Share with others",
          },
        ],
  };
}

/**
 * Format response for duplicating content
 */
export function formatDuplicateResponse(
  originalTitle: string,
  copyTitle: string,
): AssistantMessage {
  return {
    type: "success",
    content: `✓ Duplicated "${originalTitle}" as "${copyTitle}"`,
    options: [
      {
        value: "view",
        label: "View Copy",
        description: "See the duplicated content",
      },
      {
        value: "edit",
        label: "Edit Copy",
        description: "Modify the duplicated content",
      },
    ],
  };
}

/**
 * Format response for listing content
 */
export function formatListResponse(
  count: number,
  items: Array<{ id: string; title: string; type: string }>,
): AssistantMessage {
  if (count === 0) {
    return {
      type: "text",
      content:
        "No content found matching your criteria. Would you like to create something?",
      options: [
        {
          value: "create",
          label: "Create New Content",
          description: "Start creating",
        },
      ],
    };
  }

  const itemsList = items
    .slice(0, 5)
    .map((item) => `• ${item.title} (${item.type})`)
    .join("\n");

  const more = count > 5 ? `\n\n... and ${count - 5} more` : "";

  return {
    type: "text",
    content: `Found ${count} item${count !== 1 ? "s" : ""}:\n\n${itemsList}${more}`,
    options: [
      {
        value: "view_all",
        label: "View All",
        description: "See all items",
      },
      {
        value: "filter",
        label: "Filter",
        description: "Refine your search",
      },
    ],
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(
  error: string,
  suggestion?: string,
): AssistantMessage {
  return {
    type: "error",
    content: `Error: ${error}${suggestion ? `\n\n${suggestion}` : ""}`,
    options: [
      {
        value: "retry",
        label: "Try Again",
        description: "Retry the operation",
      },
      {
        value: "help",
        label: "Get Help",
        description: "Learn how to use this",
      },
    ],
  };
}

/**
 * Format clarification request
 */
export function formatClarificationRequest(
  question: string,
  options?: Array<{ label: string; value: string; description?: string }>,
): AssistantMessage {
  return {
    type: "options",
    content: question,
    options: options || [
      {
        value: "help",
        label: "Show Examples",
        description: "See example requests",
      },
      {
        value: "cancel",
        label: "Cancel",
        description: "Go back",
      },
    ],
  };
}

/**
 * Format content type selection
 */
export function formatTypeSelection(): AssistantMessage {
  return {
    type: "options",
    content: "What type of content would you like to create?",
    options: [
      {
        value: "text",
        label: "Text",
        description: "Notes, documents, ideas",
      },
      {
        value: "code",
        label: "Code",
        description: "Code snippets, scripts",
      },
      {
        value: "image",
        label: "Image",
        description: "Pictures, diagrams",
      },
      {
        value: "video",
        label: "Video",
        description: "Video files, links",
      },
      {
        value: "link",
        label: "Link",
        description: "URLs, references",
      },
      {
        value: "file",
        label: "File",
        description: "Documents, archives",
      },
    ],
  };
}

/**
 * Format visibility selection
 */
export function formatVisibilitySelection(
  itemTitle: string = "this content",
): AssistantMessage {
  return {
    type: "options",
    content: `How would you like to share ${itemTitle}?`,
    options: [
      {
        value: "public",
        label: "Public",
        description: "Anyone can view (with link)",
      },
      {
        value: "private",
        label: "Private",
        description: "Only you can view",
      },
      {
        value: "custom",
        label: "Custom",
        description: "Password protected or restricted",
      },
    ],
  };
}

/**
 * Format verification request
 */
export function formatVerificationRequest(
  action: string,
  itemTitle: string,
): AssistantMessage {
  return {
    type: "text",
    content: `⚠️ This action cannot be undone. Are you sure you want to ${action} "${itemTitle}"?`,
    options: [
      {
        value: "confirm",
        label: "Yes, Confirm",
        description: "Proceed with the action",
      },
      {
        value: "cancel",
        label: "Cancel",
        description: "Don't proceed",
      },
    ],
  };
}

/**
 * Format permission denied response
 */
export function formatPermissionDenied(
  action: string,
  reason: string,
): AssistantMessage {
  return {
    type: "error",
    content: `You don't have permission to ${action}. ${reason}`,
    options: [
      {
        value: "login",
        label: "Sign In",
        description: "Sign in to your account",
      },
      {
        value: "help",
        label: "Learn More",
        description: "Understand permissions",
      },
    ],
  };
}

/**
 * Format welcome message for new chat session
 */
export function formatWelcomeMessage(): AssistantMessage {
  return {
    type: "text",
    content:
      "Welcome! I'm your AI content assistant. I can help you create, view, edit, delete, and organize your content. What would you like to do?",
    options: [
      {
        value: "create",
        label: "Create Content",
        description: "Add something new",
      },
      {
        value: "list",
        label: "View Content",
        description: "See your items",
      },
      {
        value: "help",
        label: "Get Help",
        description: "Learn more",
      },
    ],
  };
}

/**
 * Format help/tutorial message
 */
export function formatHelpMessage(): AssistantMessage {
  return {
    type: "text",
    content: `Here are some things you can ask me:

**Create:**
"Create a new text note called 'My Ideas'"
"Add a code snippet for Python"

**View:**
"Show me all my notes"
"List content with tags: python"

**Edit:**
"Update 'My Ideas' with new text"
"Make 'Important Note' public"

**Delete:**
"Delete 'Old Notes'"
"Remove all completed items"

Just describe what you want in natural language!`,
    options: [
      {
        value: "create",
        label: "Create",
        description: "Try creating something",
      },
      {
        value: "list",
        label: "List All",
        description: "See your content",
      },
    ],
  };
}

/**
 * Format generic operation response
 */
export function formatOperationResponse(
  intentType: IntentType,
  success: boolean,
  details?: Record<string, any>,
): AssistantMessage {
  const message = formatAssistantMessage(intentType, success, details);

  if (!success) {
    return {
      type: "error",
      content: message,
      options: [
        {
          value: "retry",
          label: "Try Again",
          description: "Retry the operation",
        },
      ],
    };
  }

  // Success case - return structured response
  return {
    type: "success",
    content: message,
    options: suggestNextActions(intentType, success).map((action) => ({
      value: action.action,
      label: action.label,
      description: action.description,
    })),
  };
}
