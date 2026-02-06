import { getSupabase } from "./supabase";
import { ContentItem, BookPage, User } from "@/types/content";

// ============ Authentication ============
export const signInWithGoogle = async () => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      throw new Error(
        "Sign in is not configured. Please contact the administrator to set up Supabase credentials.",
      );
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      // Supabase not configured, but sign out is not critical
      console.log("Supabase not available for sign out");
      return;
    }
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      // Supabase not configured, user is not authenticated
      return null;
    }
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      // Supabase not configured, no session available
      return null;
    }
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  try {
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || "",
          user_metadata: session.user.user_metadata,
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      // Supabase not configured, return null subscription
      console.log("Supabase not available for auth state changes");
      return null;
    }
    throw error;
  }
};

// ============ Content CRUD ============
export const createContent = async (
  content: Omit<ContentItem, "id" | "created_at" | "updated_at" | "user_id">,
): Promise<ContentItem> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  // Generate title if empty
  const title =
    content.title || `New ${content.type} - ${new Date().toLocaleString()}`;

  // Get uploader name from user metadata or email
  const uploaderName = user.user_metadata?.full_name || user.email || "Unknown";

  const { data, error } = await supabase
    .from("content")
    .insert({
      ...content,
      title,
      user_id: user.id,
      uploader_name: uploaderName,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getContent = async (id: string): Promise<ContentItem> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getAllContent = async (filters?: {
  searchQuery?: string;
  categories?: string[];
  types?: string[];
  tags?: string[];
  sortBy?: "newest" | "oldest" | "a-z" | "word-count";
}): Promise<ContentItem[]> => {
  try {
    const supabase = getSupabase();
    const user = await getCurrentUser();

    if (!user) throw new Error("User not authenticated");

    let query = supabase.from("content").select("*").eq("user_id", user.id);

    // Filter by type
    if (filters?.types && filters.types.length > 0) {
      query = query.in("type", filters.types);
    }

    // Filter by category
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in("category", filters.categories);
    }

    // Get all content first for client-side filtering
    const { data, error } = await query;

    if (error) throw error;

    let results = data || [];

    // Client-side search and tag filtering
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.content && item.content.toLowerCase().includes(q)),
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter((item) =>
        filters.tags.some((tag) => item.tags.includes(tag)),
      );
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          results.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          break;
        case "oldest":
          results.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
          break;
        case "a-z":
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "word-count":
          results.sort((a, b) => {
            const countA = a.content ? a.content.split(/\s+/).length : 0;
            const countB = b.content ? b.content.split(/\s+/).length : 0;
            return countB - countA;
          });
          break;
      }
    } else {
      // Default: newest first
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    // Calculate word count
    results = results.map((item) => ({
      ...item,
      word_count: item.content ? item.content.split(/\s+/).length : 0,
    }));

    return results;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not initialized")) {
      console.log("Supabase not available for authenticated content");
      return [];
    }
    throw error;
  }
};

export const updateContent = async (
  id: string,
  updates: Partial<ContentItem>,
): Promise<ContentItem> => {
  const supabase = getSupabase();

  // Strip protected fields that shouldn't be updated directly
  const {
    id: _id,
    user_id: _user_id,
    created_at: _created_at,
    updated_at: _updated_at,
    ...updatableFields
  } = updates;

  const { data, error } = await supabase
    .from("content")
    .update({
      ...updatableFields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContent = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("content").delete().eq("id", id);

  if (error) throw error;
};

// ============ File Upload ============
export const uploadFile = async (
  file: File,
  userId: string,
): Promise<string> => {
  const supabase = getSupabase();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("content-files")
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage
    .from("content-files")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteFile = async (
  userId: string,
  fileName: string,
): Promise<void> => {
  const supabase = getSupabase();
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("content-files")
    .remove([filePath]);

  if (error) throw error;
};

// ============ Public Sharing ============
export const shareContent = async (
  id: string,
  isPublic: boolean,
): Promise<ContentItem> => {
  return updateContent(id, { is_public: isPublic });
};

export const getPublicContent = async (id: string): Promise<ContentItem> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (error) throw error;
  return data;
};

// Get all public content (no auth required)
export const getAllPublicContent = async (filters?: {
  searchQuery?: string;
  categories?: string[];
  types?: string[];
  tags?: string[];
  sortBy?: "newest" | "oldest" | "a-z" | "word-count";
}): Promise<ContentItem[]> => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("is_public", true);

    if (error) throw error;

    let results = data || [];

    // Filter by type
    if (filters?.types && filters.types.length > 0) {
      results = results.filter((item) => filters.types.includes(item.type));
    }

    // Filter by category
    if (filters?.categories && filters.categories.length > 0) {
      results = results.filter(
        (item) => item.category && filters.categories.includes(item.category),
      );
    }

    // Client-side search and tag filtering
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.content && item.content.toLowerCase().includes(q)),
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter((item) =>
        filters.tags.some((tag) => item.tags.includes(tag)),
      );
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "newest":
          results.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          break;
        case "oldest":
          results.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
          break;
        case "a-z":
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "word-count":
          results.sort((a, b) => {
            const countA = a.content ? a.content.split(/\s+/).length : 0;
            const countB = b.content ? b.content.split(/\s+/).length : 0;
            return countB - countA;
          });
          break;
      }
    } else {
      // Default: newest first
      results.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    // Calculate word count
    results = results.map((item) => ({
      ...item,
      word_count: item.content ? item.content.split(/\s+/).length : 0,
    }));

    return results;
  } catch (err) {
    // If Supabase is not configured or any other error, return empty array
    // Guest users will only see their own localStorage content
    console.log("Supabase not available for public content:", err);
    return [];
  }
};

// ============ Book Pages ============
export const addBookPage = async (
  bookId: string,
  page: Omit<BookPage, "id" | "created_at" | "updated_at">,
): Promise<BookPage> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("book_pages")
    .insert({
      ...page,
      book_id: bookId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getBookPages = async (bookId: string): Promise<BookPage[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("book_pages")
    .select("*")
    .eq("book_id", bookId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateBookPage = async (
  pageId: string,
  updates: Partial<BookPage>,
): Promise<BookPage> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("book_pages")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBookPage = async (pageId: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("book_pages").delete().eq("id", pageId);

  if (error) throw error;
};
