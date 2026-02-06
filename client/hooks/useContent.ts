import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, FilterState } from "@/types/content";
import {
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
  shareContent,
  toggleStatus,
} from "@/lib/api";
import {
  getGuestContent,
  createGuestContent,
  updateGuestContent,
  deleteGuestContent,
  filterGuestContent,
} from "@/lib/localStorage";
import { toast } from "sonner";

export const useContent = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    categories: [],
    types: [],
    tags: [],
    sortBy: "newest",
  });

  // Fetch content with current filters (for authenticated users) or load guest content
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let content: ContentItem[];
      if (isAuthenticated) {
        // Load from Supabase for authenticated users
        content = await getAllContent(filters);
      } else {
        // Load from localStorage for guest users
        content = filterGuestContent(filters);
      }

      setItems(content);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load content";
      setError(message);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isAuthenticated]);

  // Auto-fetch when filters or auth status change
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const createNewContent = useCallback(
    async (data: Partial<ContentItem>) => {
      try {
        const contentData = {
          type: data.type || "text",
          title: data.title || "",
          content: data.content || null,
          category: data.category || null,
          tags: data.tags || [],
          file_url: data.file_url || null,
          file_size: data.file_size || null,
          is_public: data.is_public || false,
        };

        let newItem: ContentItem;
        if (isAuthenticated) {
          newItem = await createContent(contentData);
        } else {
          newItem = createGuestContent(contentData);
        }

        setItems((prev) => [newItem, ...prev]);
        return newItem;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create content";
        throw new Error(message);
      }
    },
    [items, isAuthenticated],
  );

  const editContent = useCallback(
    async (id: string, data: Partial<ContentItem>) => {
      try {
        let updated: ContentItem;
        if (isAuthenticated) {
          updated = await updateContent(id, data);
        } else {
          updated = updateGuestContent(id, data);
        }

        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update content";
        throw new Error(message);
      }
    },
    [items, isAuthenticated],
  );

  const removeContent = useCallback(
    async (id: string) => {
      try {
        console.log("removeContent called for:", id);
        if (isAuthenticated) {
          console.log("Deleting authenticated content");
          await deleteContent(id);
        } else {
          console.log("Deleting guest content");
          deleteGuestContent(id);
          // Small delay to ensure localStorage is synced
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
        console.log("Content removed from state");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete content";
        console.error("removeContent error:", message);
        throw new Error(message);
      }
    },
    [items, isAuthenticated],
  );

  const togglePublic = useCallback(
    async (id: string, isPublic: boolean) => {
      try {
        let updated: ContentItem;
        if (isAuthenticated) {
          updated = await shareContent(id, isPublic);
        } else {
          updated = updateGuestContent(id, { is_public: isPublic });
        }

        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update sharing";
        throw new Error(message);
      }
    },
    [items, isAuthenticated],
  );

  const changeStatus = useCallback(
    async (
      id: string,
      status: "active" | "pending" | "completed",
      autoDeleteAt?: string | null,
    ) => {
      try {
        let updated: ContentItem;
        const updates: Partial<ContentItem> = { status };

        if (autoDeleteAt !== undefined) {
          updates.auto_delete_at = autoDeleteAt;
          updates.auto_delete_enabled = !!autoDeleteAt;
        }

        if (isAuthenticated) {
          updated = await toggleStatus(id, status, autoDeleteAt);
        } else {
          updated = updateGuestContent(id, updates);
        }

        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        toast.success(`Status changed to ${status}`);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update status";
        toast.error(message);
        throw new Error(message);
      }
    },
    [items, isAuthenticated],
  );

  // Get unique categories and tags from current items
  const getCategories = useCallback(() => {
    const categories = new Set<string>();
    items.forEach((item) => {
      if (item.category) categories.add(item.category);
    });
    return Array.from(categories).sort();
  }, [items]);

  const getTags = useCallback(() => {
    const tags = new Set<string>();
    items.forEach((item) => {
      item.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  return {
    items,
    isLoading,
    error,
    filters,
    setFilters,
    createNewContent,
    editContent,
    removeContent,
    togglePublic,
    changeStatus,
    refreshContent: fetchContent,
    getCategories,
    getTags,
  };
};
