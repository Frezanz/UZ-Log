import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/hooks/useContent";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, Layout } from "lucide-react";
import { toast } from "sonner";
import { processChatMessage, validateMessage } from "@/lib/chatMessageProcessor";
import {
  createChatSession,
  loadChatSession,
  saveChatMessage,
  updateSessionTimestamp,
} from "@/lib/chatApi";
import { ContentModal } from "@/components/modals/ContentModal";
import { ShareModal } from "@/components/modals/ShareModal";
import { DeleteModal } from "@/components/modals/DeleteModal";

interface ChatInterfaceProps {
  onToggleVisualMode?: () => void;
}

const ChatInterface = ({ onToggleVisualMode }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, createContent, updateContent, deleteContent, shareContent } = useContent();

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<"content" | "share" | "delete" | null>(null);
  const [modalData, setModalData] = useState<Partial<ContentItem> | ContentItem | null>(null);
  const [modalItemId, setModalItemId] = useState<string | null>(null);

  const handleToggleVisualMode = () => {
    if (onToggleVisualMode) {
      onToggleVisualMode();
    } else {
      navigate("/visual");
    }
  };

  // Initialize or load chat session
  useEffect(() => {
    const loadSession = async () => {
      try {
        let session;

        // Create new session for authenticated users
        if (user) {
          session = await createChatSession(user.id);
          setSessionId(session.id);

          // Load existing messages from this session
          const savedMessages = await loadChatSession(session.id);
          if (savedMessages.length > 0) {
            setMessages(savedMessages);
            return;
          }
        } else {
          // Generate temporary session ID for guests
          const id = `session-${Date.now()}`;
          setSessionId(id);
        }

        // Add initial greeting if no messages
        const greeting: ChatMessageType = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            "Hello! I'm Uz-Assistant, your content management companion. I can help you create, view, edit, delete, and organize your content. What would you like to do?",
          timestamp: new Date().toISOString(),
        };
        setMessages([greeting]);

        // Save greeting to persistence
        if (session) {
          await saveChatMessage(session.id, greeting);
        }
      } catch (error) {
        console.error("Error initializing chat session:", error);
        // Fallback: show greeting without persistence
        const greeting: ChatMessageType = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            "Hello! I'm here to help you manage your content. You can create, view, edit, delete, or organize your content. What would you like to do?",
          timestamp: new Date().toISOString(),
        };
        setMessages([greeting]);
        setSessionId(`session-${Date.now()}`);
      }
    };

    loadSession();
  }, [user]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Validate message
    const validation = validateMessage(input);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Process the message
      const result = await processChatMessage({
        message: userInput,
        contentItems: items,
        user: user || null,
      });

      // Add user message
      setMessages((prev) => [...prev, result.userMessage]);

      // Save user message to persistence
      if (sessionId) {
        await saveChatMessage(sessionId, result.userMessage, result.intent);
        await updateSessionTimestamp(sessionId);
      }

      // Add assistant response
      setMessages((prev) => [...prev, result.assistantMessage]);

      // Save assistant response to persistence
      if (sessionId) {
        await saveChatMessage(sessionId, result.assistantMessage, result.intent);
        await updateSessionTimestamp(sessionId);
      }

      // Handle modal if needed
      if (result.modalState && result.modalState.type) {
        setActiveModal(result.modalState.type);
        setModalData(result.modalState.data || null);
        if (result.operationResult.resultData?.itemId) {
          setModalItemId(result.operationResult.resultData.itemId);
        } else if (result.modalState.data && "id" in result.modalState.data) {
          setModalItemId((result.modalState.data as ContentItem).id);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: ChatMessageType = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to process message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear chat history? This cannot be undone.")) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Chat history cleared. I'm ready to help! What would you like to do?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setModalData(null);
    setModalItemId(null);
  };

  const handleContentModalSave = async (data: Partial<ContentItem>) => {
    try {
      setIsLoading(true);

      if (modalItemId) {
        // Update existing content
        await updateContent(modalItemId, data);
        toast.success("Content updated successfully");
      } else {
        // Create new content
        await createContent(data as Omit<ContentItem, "id" | "created_at" | "updated_at">);
        toast.success("Content created successfully");
      }

      handleModalClose();

      // Add success message to chat
      const successMessage: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `${modalItemId ? "Updated" : "Created"} content successfully!`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, successMessage]);

      // Save success message to persistence
      if (sessionId) {
        await saveChatMessage(sessionId, successMessage);
        await updateSessionTimestamp(sessionId);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modalItemId) return;

    try {
      setIsLoading(true);
      await deleteContent(modalItemId);
      toast.success("Content deleted successfully");
      handleModalClose();

      // Add success message to chat
      const successMessage: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Content deleted successfully!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, successMessage]);

      // Save success message to persistence
      if (sessionId) {
        await saveChatMessage(sessionId, successMessage);
        await updateSessionTimestamp(sessionId);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareToggle = async (item: ContentItem, isPublic: boolean) => {
    try {
      setIsLoading(true);
      await shareContent(item.id, isPublic);
      toast.success(isPublic ? "Content shared publicly" : "Content made private");
      handleModalClose();

      // Add success message to chat
      const successMessage: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Content is now ${isPublic ? "public" : "private"}!`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, successMessage]);

      // Save success message to persistence
      if (sessionId) {
        await saveChatMessage(sessionId, successMessage);
        await updateSessionTimestamp(sessionId);
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      toast.error("Failed to update sharing settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Uz-Assistant
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleVisualMode}
            className="text-sm gap-2"
            title="Switch to visual mode"
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Visual Mode</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages area - ChatGPT style */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="w-full h-full flex flex-col justify-start p-4 sm:p-6">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } w-full`}
              >
                <div
                  className={`max-w-2xl rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span
                    className={`text-xs opacity-60 mt-1 block ${
                      message.role === "user" ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="bg-gray-200 text-gray-900 rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uz-Assistant is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input area - ChatGPT style */}
      <div className="border-t bg-white px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like to do? (Create, view, edit, delete content...)"
              className="resize-none w-full pr-12 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm p-3 text-sm"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 h-8 w-8 flex items-center justify-center transition-colors"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="border-t px-6 py-2 text-xs text-muted-foreground bg-muted/30">
          <p>
            Session: {sessionId} | User: {user?.email || "Guest"} | Items:{" "}
            {items.length}
          </p>
        </div>
      )}

      {/* Modals */}
      <ContentModal
        isOpen={activeModal === "content"}
        onClose={handleModalClose}
        onSave={handleContentModalSave}
        initialData={
          modalData && "id" in modalData
            ? (modalData as ContentItem)
            : undefined
        }
      />

      <DeleteModal
        isOpen={activeModal === "delete"}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        title={
          modalData && "title" in modalData ? modalData.title : "Content"
        }
      />

      <ShareModal
        isOpen={activeModal === "share"}
        onClose={handleModalClose}
        item={
          modalData && "id" in modalData
            ? (modalData as ContentItem)
            : null
        }
        onTogglePublic={handleShareToggle}
      />
    </div>
  );
};

export default ChatInterface;
