/**
 * Permission and access control checks for chat operations
 * Determines what actions users are allowed to perform
 */

import { ContentItem } from "@/types/content";

export interface User {
  id: string;
  email: string;
}

/**
 * Check if user can view a content item
 */
export function canViewContent(user: User | null, item: ContentItem): boolean {
  // Public content can be viewed by anyone
  if (item.is_public) {
    return true;
  }

  // Owner can view their own content
  if (user && user.id === item.user_id) {
    return true;
  }

  // Guest users can only view their own local content
  if (!user && item.user_id === "guest") {
    return true;
  }

  return false;
}

/**
 * Check if user can edit a content item
 */
export function canEditContent(user: User | null, item: ContentItem): boolean {
  // Only owner can edit
  if (user && user.id === item.user_id) {
    return true;
  }

  // Guest can edit their own local content
  if (!user && item.user_id === "guest") {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a content item
 */
export function canDeleteContent(user: User | null, item: ContentItem): boolean {
  // Only owner can delete
  if (user && user.id === item.user_id) {
    return true;
  }

  // Guest can delete their own local content
  if (!user && item.user_id === "guest") {
    return true;
  }

  return false;
}

/**
 * Check if user can share a content item
 */
export function canShareContent(user: User | null, item: ContentItem): boolean {
  // Only authenticated users can share (create share links, etc.)
  // But they can make their own content public/private

  if (user && user.id === item.user_id) {
    return true;
  }

  // Guest users cannot create share links, but can mark content as public
  if (!user && item.user_id === "guest") {
    return true; // Can toggle public/private but no custom share links
  }

  return false;
}

/**
 * Check if user can duplicate a content item
 */
export function canDuplicateContent(user: User | null, item: ContentItem): boolean {
  // Can only duplicate if you can view it
  return canViewContent(user, item);
}

/**
 * Check if user can protect a content item (set password, etc.)
 */
export function canProtectContent(user: User | null, item: ContentItem): boolean {
  // Only owner can protect content
  if (user && user.id === item.user_id) {
    return true;
  }

  if (!user && item.user_id === "guest") {
    return true;
  }

  return false;
}

/**
 * Check if user can perform bulk operations on multiple items
 */
export function canBulkDelete(user: User | null, items: ContentItem[]): boolean {
  // User must be able to delete all items
  return items.every((item) => canDeleteContent(user, item));
}

export function canBulkEdit(user: User | null, items: ContentItem[]): boolean {
  // User must be able to edit all items
  return items.every((item) => canEditContent(user, item));
}

export function canBulkShare(user: User | null, items: ContentItem[]): boolean {
  // User must be able to share all items
  return items.every((item) => canShareContent(user, item));
}

/**
 * Get permission error message
 */
export function getPermissionError(
  action: string,
  user: User | null,
): string {
  if (!user) {
    return `You must be signed in to ${action} this content. Please sign in and try again.`;
  }

  return `You don't have permission to ${action} this content.`;
}

/**
 * Check if user can create content
 */
export function canCreateContent(user: User | null): boolean {
  // Both authenticated and guest users can create content
  return true;
}

/**
 * Check if user can list/search content
 */
export function canListContent(user: User | null): boolean {
  // Both authenticated and guest users can list
  return true;
}
