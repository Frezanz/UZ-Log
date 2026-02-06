import { ContentItem } from "@/types/content";

const STORAGE_KEY = "uz-log-guest-content";

// Generate a simple UUID
const generateId = (): string => {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all guest content from localStorage
export const getGuestContent = (): ContentItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items = data ? JSON.parse(data) : [];
    // Ensure all items have a status
    return items.map((item: ContentItem) => ({
      ...item,
      status: item.status || "active",
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
    return item ? { ...item, status: item.status || "active" } : null;
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
