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
  duplicateContent,
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

      // Clean up expired auto-delete items
      const now = new Date();
      const itemsToDelete: string[] = [];

      content = content.filter((item) => {
        if (item.auto_delete_at && item.auto_delete_enabled) {
          const deleteTime = new Date(item.auto_delete_at);
          if (deleteTime <= now) {
            itemsToDelete.push(item.id);
            return false;
          }
        }
        return true;
      });

      // Delete expired items
      for (const id of itemsToDelete) {
        try {
          if (isAuthenticated) {
            await deleteContent(id);
          } else {
            deleteGuestContent(id);
          }
        } catch (err) {
          console.error("Error deleting expired item:", err);
        }
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

  // Periodically check for expired auto-delete items
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hasExpired = false;

      items.forEach((item) => {
        if (item.auto_delete_at && item.auto_delete_enabled) {
          const deleteTime = new Date(item.auto_delete_at);
          if (deleteTime <= now) {
            hasExpired = true;
          }
        }
      });

      if (hasExpired) {
        fetchContent();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [items, fetchContent]);

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
          voice_url: data.voice_url || null,
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

  const duplicateItem = useCallback(
    async (id: string) => {
      try {
        let newItem: ContentItem;
        if (isAuthenticated) {
          newItem = await duplicateContent(id);
          // For authenticated users, need to manually add to state
          setItems((prev) => [newItem, ...prev]);
        } else {
          // For guest users, manually duplicate from localStorage
          const original = items.find((i) => i.id === id);
          if (!original) throw new Error("Item not found");

          const {
            id: _id,
            created_at: _ca,
            updated_at: _ua,
            ...rest
          } = original;
          // createNewContent already adds to state
          await createNewContent({
            ...rest,
            title: `${original.title} (copy)`,
            is_public: false,
            auto_delete_at: null,
            auto_delete_enabled: false,
            status: "active",
          });
        }

        toast.success("Item duplicated successfully!");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to duplicate item";
        toast.error(message);
        throw new Error(message);
      }
    },
    [items, isAuthenticated, createNewContent],
  );

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
    duplicateItem,
    refreshContent: fetchContent,
    getCategories,
    getTags,
  };
};
