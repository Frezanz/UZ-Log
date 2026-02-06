import { getSupabase } from "./supabase";
import { ContentItem, BookPage, User, ContentLink, ContentLinkWithTarget, LinkType, ShareLink } from "@/types/content";

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
  return {
    ...data,
    status: data.status || "active",
  };
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

    // Calculate word count and ensure status is set
    results = results.map((item) => ({
      ...item,
      status: item.status || "active",
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

export const duplicateContent = async (id: string): Promise<ContentItem> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  // Get the original content
  const original = await getContent(id);

  // Create new item with duplicated content
  const duplicatedContent: Omit<
    ContentItem,
    "id" | "created_at" | "updated_at" | "user_id"
  > = {
    ...original,
    title: `${original.title} (copy)`,
    is_public: false, // Always make duplicates private
    auto_delete_at: null, // Don't copy auto-delete settings
    auto_delete_enabled: false,
    status: "active", // Reset status to active
  };

  return createContent(duplicatedContent);
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

// ============ Content Status ============
export const toggleStatus = async (
  id: string,
  status: "active" | "pending" | "completed",
  autoDeleteAt?: string | null,
): Promise<ContentItem> => {
  const updates: Partial<ContentItem> = { status };
  if (autoDeleteAt !== undefined) {
    updates.auto_delete_at = autoDeleteAt;
    updates.auto_delete_enabled = !!autoDeleteAt;
  }
  return updateContent(id, updates);
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
  return {
    ...data,
    status: data.status || "active",
  };
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

    // Calculate word count and ensure status is set
    results = results.map((item) => ({
      ...item,
      status: item.status || "active",
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

// ============ Content Links ============
export const createLink = async (
  sourceContentId: string,
  targetContentId: string,
  linkType: LinkType,
): Promise<ContentLink> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("content_links")
    .insert({
      source_content_id: sourceContentId,
      target_content_id: targetContentId,
      link_type: linkType,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLink = async (linkId: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("content_links")
    .delete()
    .eq("id", linkId);

  if (error) throw error;
};

export const getLinksForContent = async (
  contentId: string,
): Promise<ContentLinkWithTarget[]> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  // Get all links where this content is the source
  const { data: links, error } = await supabase
    .from("content_links")
    .select("*")
    .eq("source_content_id", contentId)
    .eq("user_id", user.id);

  if (error) throw error;

  // Fetch target content for each link
  const linksWithTarget: ContentLinkWithTarget[] = [];
  for (const link of links || []) {
    try {
      const targetContent = await getContent(link.target_content_id);
      linksWithTarget.push({
        ...link,
        target_content: targetContent,
      });
    } catch {
      // Skip if target content can't be retrieved
      linksWithTarget.push(link);
    }
  }

  return linksWithTarget;
};

export const getBacklinksForContent = async (
  contentId: string,
): Promise<ContentLinkWithTarget[]> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  // Get all links where this content is the target
  const { data: links, error } = await supabase
    .from("content_links")
    .select("*")
    .eq("target_content_id", contentId)
    .eq("user_id", user.id);

  if (error) throw error;

  // Fetch source content for each link
  const linksWithSource: ContentLinkWithTarget[] = [];
  for (const link of links || []) {
    try {
      const sourceContent = await getContent(link.source_content_id);
      linksWithSource.push({
        ...link,
        target_content: sourceContent, // Store source as target for consistency
      });
    } catch {
      // Skip if source content can't be retrieved
      linksWithSource.push(link);
    }
  }

  return linksWithSource;
};

// ============ Share Links ============
export const createShareLink = async (
  contentId: string,
  options?: {
    password?: string;
    expiresIn?: number; // Days until expiration
  },
): Promise<ShareLink> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  // Generate a unique token
  const token = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  let expiresAt: string | null = null;
  if (options?.expiresIn) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + options.expiresIn);
    expiresAt = expirationDate.toISOString();
  }

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      content_id: contentId,
      token,
      password: options?.password || null,
      expires_at: expiresAt,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getShareLinks = async (contentId: string): Promise<ShareLink[]> => {
  const supabase = getSupabase();
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("content_id", contentId)
    .eq("user_id", user.id);

  if (error) throw error;
  return data || [];
};

export const deleteShareLink = async (linkId: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("share_links")
    .delete()
    .eq("id", linkId);

  if (error) throw error;
};

export const getSharedContent = async (
  token: string,
  password?: string,
): Promise<ContentItem> => {
  const supabase = getSupabase();

  // Get share link
  const { data: shareLink, error: linkError } = await supabase
    .from("share_links")
    .select("*")
    .eq("token", token)
    .single();

  if (linkError) throw new Error("Share link not found");

  // Check if link has expired
  if (shareLink.expires_at) {
    const expirationDate = new Date(shareLink.expires_at);
    if (new Date() > expirationDate) {
      throw new Error("Share link has expired");
    }
  }

  // Check password if required
  if (shareLink.password && shareLink.password !== password) {
    throw new Error("Invalid password");
  }

  // Get the content
  const content = await getPublicContent(shareLink.content_id);
  return content;
};

// ============ Content Merge (Duplicate Management) ============
export const mergeContent = async (
  primaryContentId: string,
  duplicateContentId: string,
  mergedData: Partial<ContentItem>,
): Promise<ContentItem> => {
  const supabase = getSupabase();

  // Update primary content with merged data
  const { data: updated, error: updateError } = await supabase
    .from("content")
    .update({
      ...mergedData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", primaryContentId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Delete the duplicate content
  await deleteContent(duplicateContentId);

  return updated;
};
