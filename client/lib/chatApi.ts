/**
 * Chat API Layer
 * Handles persistence of chat sessions and messages to Supabase
 * Falls back to localStorage for guest users
 */

import { ChatMessage, ChatSession, Intent } from "@/types/chat";
import { getSupabase } from "@/lib/supabase";

/**
 * Create a new chat session for an authenticated user
 */
export async function createChatSession(userId: string): Promise<ChatSession> {
  const supabase = getSupabase();

  if (!supabase) {
    // Fallback for guest users
    return createLocalChatSession(userId);
  }

  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      messages: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error creating chat session:", error);
    // Fallback to local session
    return createLocalChatSession(userId);
  }
}

/**
 * Load a chat session and all its messages
 */
export async function loadChatSession(sessionId: string): Promise<ChatMessage[]> {
  const supabase = getSupabase();

  if (!supabase) {
    // Fallback for guest users
    return loadLocalChatMessages(sessionId);
  }

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (
      data?.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        metadata: msg.metadata || undefined,
      })) || []
    );
  } catch (error) {
    console.error("Error loading chat session:", error);
    // Fallback to local messages
    return loadLocalChatMessages(sessionId);
  }
}

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(
  sessionId: string,
  message: ChatMessage,
  intent?: Intent,
): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    // Fallback for guest users
    saveLocalChatMessage(sessionId, message);
    return;
  }

  try {
    const { error } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
      metadata: message.metadata || null,
      intent_data: intent ? JSON.stringify(intent) : null,
      created_at: message.timestamp,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving chat message:", error);
    // Fallback to local storage
    saveLocalChatMessage(sessionId, message);
  }
}

/**
 * Get all chat sessions for a user
 */
export async function listChatSessions(userId: string): Promise<ChatSession[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return loadLocalChatSessions(userId);
  }

  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (
      data?.map((session) => ({
        id: session.id,
        userId: session.user_id,
        messages: [],
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      })) || []
    );
  } catch (error) {
    console.error("Error listing chat sessions:", error);
    return [];
  }
}

/**
 * Delete a chat session (soft delete)
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) {
    deleteLocalChatSession(sessionId);
    return;
  }

  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    // Fallback to local deletion
    deleteLocalChatSession(sessionId);
  }
}

/**
 * Update session timestamp when new messages arrive
 */
export async function updateSessionTimestamp(sessionId: string): Promise<void> {
  const supabase = getSupabase();

  if (!supabase) return;

  try {
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  } catch (error) {
    console.error("Error updating session timestamp:", error);
  }
}

// ============ LocalStorage Fallback ============

const CHAT_SESSIONS_KEY = "chat_sessions";
const CHAT_MESSAGES_KEY = "chat_messages";

function createLocalChatSession(userId: string): ChatSession {
  const sessionId = `session-${Date.now()}`;
  const session: ChatSession = {
    id: sessionId,
    userId: userId || "guest",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sessions = loadLocalChatSessions(userId);
  sessions.push(session);
  localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));

  return session;
}

function loadLocalChatMessages(sessionId: string): ChatMessage[] {
  try {
    const messages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (!messages) return [];

    const allMessages = JSON.parse(messages) as Record<string, ChatMessage[]>;
    return allMessages[sessionId] || [];
  } catch {
    return [];
  }
}

function saveLocalChatMessage(sessionId: string, message: ChatMessage): void {
  try {
    const messages = localStorage.getItem(CHAT_MESSAGES_KEY);
    const allMessages = messages
      ? (JSON.parse(messages) as Record<string, ChatMessage[]>)
      : {};

    if (!allMessages[sessionId]) {
      allMessages[sessionId] = [];
    }

    allMessages[sessionId].push(message);
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(allMessages));
  } catch (error) {
    console.error("Error saving message to localStorage:", error);
  }
}

function loadLocalChatSessions(userId: string): ChatSession[] {
  try {
    const sessions = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (!sessions) return [];

    const allSessions = JSON.parse(sessions) as ChatSession[];
    return allSessions.filter((s) => s.userId === userId || s.userId === "guest");
  } catch {
    return [];
  }
}

function deleteLocalChatSession(sessionId: string): void {
  try {
    const sessions = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (!sessions) return;

    const allSessions = (JSON.parse(sessions) as ChatSession[]).filter(
      (s) => s.id !== sessionId,
    );
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(allSessions));

    // Also delete messages for this session
    const messages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (messages) {
      const allMessages = JSON.parse(messages) as Record<string, ChatMessage[]>;
      delete allMessages[sessionId];
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(allMessages));
    }
  } catch (error) {
    console.error("Error deleting session from localStorage:", error);
  }
}
