import { ContentItem } from "@/types/content";
import { ChatMessage, ChatSession } from "@/types/chat";

const STORAGE_KEY = "uz-log-guest-content";
const CHAT_SESSIONS_KEY = "uz-log-chat-sessions";
const CHAT_MESSAGES_KEY = "uz-log-chat-messages";
let idCounter = 0;

// Generate a truly unique UUID
const generateId = (): string => {
  // Use crypto.randomUUID if available, otherwise fallback to custom generation
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `local-${crypto.randomUUID()}`;
  }
  // Fallback: timestamp + counter + random
  idCounter++;
  return `local-${Date.now()}-${idCounter}-${Math.random().toString(36).substr(2, 15)}`;
};

// Get all guest content from localStorage
export const getGuestContent = (): ContentItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items = data ? JSON.parse(data) : [];
    // Ensure all items have a status and auto_delete fields
    return items.map((item: ContentItem) => ({
      ...item,
      status: item.status || "active",
      auto_delete_at: item.auto_delete_at || null,
      auto_delete_enabled: item.auto_delete_enabled || false,
    }));
  } catch (error) {
    console.error("Failed to read guest content from localStorage:", error);
    return [];
  }
};

// Get a single guest content item by ID
export const getGuestContentById = (id: string): ContentItem | null => {
  try {
    const items = getGuestContent();
    const item = items.find((item) => item.id === id);
    return item
      ? {
          ...item,
          status: item.status || "active",
          auto_delete_at: item.auto_delete_at || null,
          auto_delete_enabled: item.auto_delete_enabled || false,
        }
      : null;
  } catch (error) {
    console.error("Failed to retrieve guest content by ID:", error);
    return null;
  }
};

// Save guest content to localStorage
const saveGuestContent = (items: ContentItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save guest content to localStorage:", error);
  }
};

// Create a new guest content item
export const createGuestContent = (
  content: Omit<
    ContentItem,
    "id" | "created_at" | "updated_at" | "user_id" | "word_count"
  >,
): ContentItem => {
  const now = new Date().toISOString();
  const newItem: ContentItem = {
    ...content,
    id: generateId(),
    user_id: "guest",
    uploader_name: "Anonymous",
    status: content.status || "active",
    auto_delete_at: content.auto_delete_at || null,
    auto_delete_enabled: content.auto_delete_enabled || false,
    created_at: now,
    updated_at: now,
    word_count: content.content ? content.content.split(/\s+/).length : 0,
  };

  const items = getGuestContent();
  items.unshift(newItem); // Add to beginning
  saveGuestContent(items);

  return newItem;
};

// Update guest content item
export const updateGuestContent = (
  id: string,
  updates: Partial<ContentItem>,
): ContentItem => {
  const items = getGuestContent();
  const itemIndex = items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    throw new Error("Content item not found");
  }

  const updated: ContentItem = {
    ...items[itemIndex],
    ...updates,
    status: updates.status || items[itemIndex].status || "active",
    auto_delete_at:
      updates.auto_delete_at !== undefined
        ? updates.auto_delete_at
        : items[itemIndex].auto_delete_at,
    auto_delete_enabled:
      updates.auto_delete_enabled !== undefined
        ? updates.auto_delete_enabled
        : items[itemIndex].auto_delete_enabled,
    updated_at: new Date().toISOString(),
    word_count: updates.content
      ? updates.content.split(/\s+/).length
      : items[itemIndex].word_count,
  };

  items[itemIndex] = updated;
  saveGuestContent(items);

  return updated;
};

// Delete guest content item
export const deleteGuestContent = (id: string): void => {
  try {
    console.log("deleteGuestContent called for:", id);
    const items = getGuestContent();
    console.log("Current items in localStorage:", items.length);
    const filtered = items.filter((item) => item.id !== id);
    console.log("Items after filtering:", filtered.length);
    saveGuestContent(filtered);
    console.log("localStorage updated successfully");
  } catch (error) {
    console.error("Error in deleteGuestContent:", error);
    throw error;
  }
};

// Filter and sort guest content
export const filterGuestContent = (
  filters: {
    searchQuery?: string;
    categories?: string[];
    types?: string[];
    tags?: string[];
    sortBy?: "newest" | "oldest" | "a-z" | "word-count";
  } = {},
): ContentItem[] => {
  let results = getGuestContent();

  // Filter by type
  if (filters.types && filters.types.length > 0) {
    results = results.filter((item) => filters.types!.includes(item.type));
  }

  // Filter by category
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(
      (item) => item.category && filters.categories!.includes(item.category),
    );
  }

  // Search
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.content && item.content.toLowerCase().includes(q)),
    );
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((item) =>
      filters.tags!.some((tag) => item.tags.includes(tag)),
    );
  }

  // Sorting
  switch (filters.sortBy) {
    case "oldest":
      results.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      break;
    case "a-z":
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "word-count":
      results.sort((a, b) => b.word_count - a.word_count);
      break;
    case "newest":
    default:
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  return results;
};

// Clear all guest content
export const clearGuestContent = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear guest content:", error);
  }
};

// Upload file for guest users (store as base64)
export const uploadGuestFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

// Get file size in MB
export const getFileSizeMB = (file: File): string => {
  return (file.size / 1024 / 1024).toFixed(2);
};
