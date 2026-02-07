/**
 * Chat Operations Handler
 * Executes content operations based on detected intents
 * Bridges chat logic to existing useContent hooks
 */

import { ContentItem } from "@/types/content";
import {
  canCreateContent,
  canViewContent,
  canEditContent,
  canDeleteContent,
  canShareContent,
  canProtectContent,
  canDuplicateContent,
  getPermissionError,
  type User,
} from "./chatPermissions";

export interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Create new content via chat
 */
export async function chatCreateContent(
  user: User | null,
  parameters: Record<string, any>,
  createFn: (data: any) => Promise<ContentItem>,
): Promise<OperationResult> {
  try {
    // Check permission
    if (!canCreateContent(user)) {
      return {
        success: false,
        message: getPermissionError("create", user),
        error: "PERMISSION_DENIED",
      };
    }

    // Validate required parameters
    if (!parameters.type) {
      return {
        success: false,
        message: "Please specify a content type (text, code, image, etc.)",
        error: "MISSING_PARAMETER",
      };
    }

    // Create content using provided function
    const contentData = {
      type: parameters.type,
      title: parameters.title || "Untitled",
      content: parameters.content || null,
      category: parameters.category || null,
      tags: parameters.tags || [],
      is_public: parameters.is_public || false,
      auto_delete_enabled: parameters.auto_delete_enabled || false,
      auto_delete_at: parameters.auto_delete_at || null,
      file_url: parameters.file_url || null,
      file_size: parameters.file_size || null,
      voice_url: parameters.voice_url || null,
    };

    const newItem = await createFn(contentData);

    return {
      success: true,
      message: `✓ Created "${newItem.title}"`,
      data: { id: newItem.id, title: newItem.title, type: newItem.type },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create content";
    return {
      success: false,
      message: `Error creating content: ${message}`,
      error: "CREATE_FAILED",
    };
  }
}

/**
 * Retrieve/view content via chat
 */
export async function chatRetrieveContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
): Promise<OperationResult> {
  try {
    if (!parameters.itemId) {
      return {
        success: false,
        message: "Please specify which content to view",
        error: "MISSING_PARAMETER",
      };
    }

    const item = items.find((i) => i.id === parameters.itemId);
    if (!item) {
      return {
        success: false,
        message: "Content not found",
        error: "NOT_FOUND",
      };
    }

    // Check permission
    if (!canViewContent(user, item)) {
      return {
        success: false,
        message: getPermissionError("view", user),
        error: "PERMISSION_DENIED",
      };
    }

    return {
      success: true,
      message: `Retrieved: ${item.title}`,
      data: {
        id: item.id,
        title: item.title,
        type: item.type,
        is_public: item.is_public,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve content";
    return {
      success: false,
      message,
      error: "RETRIEVE_FAILED",
    };
  }
}

/**
 * Update content via chat
 */
export async function chatUpdateContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
  updateFn: (id: string, data: any) => Promise<ContentItem>,
): Promise<OperationResult> {
  try {
    if (!parameters.itemId) {
      return {
        success: false,
        message: "Please specify which content to update",
        error: "MISSING_PARAMETER",
      };
    }

    const item = items.find((i) => i.id === parameters.itemId);
    if (!item) {
      return {
        success: false,
        message: "Content not found",
        error: "NOT_FOUND",
      };
    }

    // Check permission
    if (!canEditContent(user, item)) {
      return {
        success: false,
        message: getPermissionError("edit", user),
        error: "PERMISSION_DENIED",
      };
    }

    // Update with provided parameters
    const updateData: Record<string, any> = {};
    if (parameters.title) updateData.title = parameters.title;
    if (parameters.content) updateData.content = parameters.content;
    if (parameters.category) updateData.category = parameters.category;
    if (parameters.tags) updateData.tags = parameters.tags;

    const updated = await updateFn(parameters.itemId, updateData);

    return {
      success: true,
      message: `✓ Updated "${updated.title}"`,
      data: { id: updated.id, title: updated.title },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update content";
    return {
      success: false,
      message: `Error updating content: ${message}`,
      error: "UPDATE_FAILED",
    };
  }
}

/**
 * Delete content via chat
 */
export async function chatDeleteContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
  deleteFn: (id: string) => Promise<void>,
): Promise<OperationResult> {
  try {
    if (!parameters.itemId) {
      return {
        success: false,
        message: "Please specify which content to delete",
        error: "MISSING_PARAMETER",
      };
    }

    const item = items.find((i) => i.id === parameters.itemId);
    if (!item) {
      return {
        success: false,
        message: "Content not found",
        error: "NOT_FOUND",
      };
    }

    // Check permission
    if (!canDeleteContent(user, item)) {
      return {
        success: false,
        message: getPermissionError("delete", user),
        error: "PERMISSION_DENIED",
      };
    }

    await deleteFn(parameters.itemId);

    return {
      success: true,
      message: `✓ Deleted "${item.title}"`,
      data: { id: item.id },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete content";
    return {
      success: false,
      message: `Error deleting content: ${message}`,
      error: "DELETE_FAILED",
    };
  }
}

/**
 * Share content via chat
 */
export async function chatShareContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
  shareFn: (id: string, isPublic: boolean) => Promise<ContentItem>,
): Promise<OperationResult> {
  try {
    if (!parameters.itemId) {
      return {
        success: false,
        message: "Please specify which content to share",
        error: "MISSING_PARAMETER",
      };
    }

    const item = items.find((i) => i.id === parameters.itemId);
    if (!item) {
      return {
        success: false,
        message: "Content not found",
        error: "NOT_FOUND",
      };
    }

    // Check permission
    if (!canShareContent(user, item)) {
      return {
        success: false,
        message: getPermissionError("share", user),
        error: "PERMISSION_DENIED",
      };
    }

    const isPublic = parameters.is_public ?? true;
    const updated = await shareFn(parameters.itemId, isPublic);

    return {
      success: true,
      message: `✓ "${updated.title}" is now ${isPublic ? "public" : "private"}`,
      data: { id: updated.id, is_public: updated.is_public },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to share content";
    return {
      success: false,
      message: `Error sharing content: ${message}`,
      error: "SHARE_FAILED",
    };
  }
}

/**
 * Duplicate content via chat
 */
export async function chatDuplicateContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
  duplicateFn: (id: string) => Promise<void>,
): Promise<OperationResult> {
  try {
    if (!parameters.itemId) {
      return {
        success: false,
        message: "Please specify which content to duplicate",
        error: "MISSING_PARAMETER",
      };
    }

    const item = items.find((i) => i.id === parameters.itemId);
    if (!item) {
      return {
        success: false,
        message: "Content not found",
        error: "NOT_FOUND",
      };
    }

    // Check permission
    if (!canDuplicateContent(user, item)) {
      return {
        success: false,
        message: getPermissionError("duplicate", user),
        error: "PERMISSION_DENIED",
      };
    }

    await duplicateFn(parameters.itemId);

    return {
      success: true,
      message: `✓ Duplicated "${item.title}"`,
      data: { id: item.id },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to duplicate content";
    return {
      success: false,
      message: `Error duplicating content: ${message}`,
      error: "DUPLICATE_FAILED",
    };
  }
}

/**
 * List content via chat
 */
export function chatListContent(
  user: User | null,
  parameters: Record<string, any>,
  items: ContentItem[],
): OperationResult {
  try {
    // Filter items based on parameters
    let filtered = items;

    // Filter by type
    if (parameters.type) {
      filtered = filtered.filter((item) => item.type === parameters.type);
    }

    // Filter by category
    if (parameters.category) {
      filtered = filtered.filter(
        (item) => item.category === parameters.category,
      );
    }

    // Filter by tags
    if (parameters.tags && parameters.tags.length > 0) {
      filtered = filtered.filter((item) =>
        parameters.tags.some((tag: string) => item.tags.includes(tag)),
      );
    }

    // Permission check - only show items user can view
    const visibleItems = filtered.filter((item) => canViewContent(user, item));

    return {
      success: true,
      message: `Found ${visibleItems.length} item${visibleItems.length !== 1 ? "s" : ""}`,
      data: {
        count: visibleItems.length,
        items: visibleItems.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
        })),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list content";
    return {
      success: false,
      message,
      error: "LIST_FAILED",
    };
  }
}
