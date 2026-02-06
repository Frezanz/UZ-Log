export type ContentType =
  | "text"
  | "code"
  | "image"
  | "video"
  | "file"
  | "link"
  | "prompt"
  | "script"
  | "book";

export type ContentStatus = "active" | "pending" | "completed";

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  type: ContentType;
  content: string | null;
  category: string | null;
  tags: string[];
  file_url: string | null;
  file_size: string | null;
  is_public: boolean;
  status?: ContentStatus;
  created_at: string;
  updated_at: string;
  word_count?: number;
  uploader_name?: string;
  auto_delete_at?: string | null;
  auto_delete_enabled?: boolean;
}

export interface BookPage {
  id: string;
  book_id: string;
  title: string;
  order: number;
  content: string | null;
  type: "text" | "image" | "file";
  created_at: string;
  updated_at: string;
}

export interface BookContent extends ContentItem {
  type: "book";
  pages?: BookPage[];
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface FilterState {
  searchQuery: string;
  categories: string[];
  types: ContentType[];
  tags: string[];
  sortBy: "newest" | "oldest" | "a-z" | "word-count";
}
