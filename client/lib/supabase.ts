import { createClient } from "@supabase/supabase-js";

// These will be provided by environment variables or configured in settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export let supabase: ReturnType<typeof createClient> | null = null;

export const initializeSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
  localStorage.setItem("supabase_url", url);
  localStorage.setItem("supabase_key", key);
};

// Try to initialize with stored credentials if available
const storedUrl = localStorage.getItem("supabase_url");
const storedKey = localStorage.getItem("supabase_key");

if (supabaseUrl && supabaseKey) {
  initializeSupabase(supabaseUrl, supabaseKey);
} else if (storedUrl && storedKey) {
  initializeSupabase(storedUrl, storedKey);
}

export const getSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase not initialized. Please configure credentials.");
  }
  return supabase;
};

export const isSupabaseConfigured = (): boolean => {
  return !!supabase && supabaseUrl !== "" && supabaseKey !== "";
};

export const getSupabaseConfigStatus = (): {
  configured: boolean;
  message: string;
} => {
  if (!supabaseUrl) {
    return {
      configured: false,
      message: "Supabase URL is not configured. Sign in is unavailable.",
    };
  }
  if (!supabaseKey) {
    return {
      configured: false,
      message: "Supabase API key is not configured. Sign in is unavailable.",
    };
  }
  if (!supabase) {
    return {
      configured: false,
      message: "Supabase is not initialized. Sign in is unavailable.",
    };
  }
  return {
    configured: true,
    message: "Supabase is configured.",
  };
};
