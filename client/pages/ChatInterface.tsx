import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/hooks/useContent";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Trash2, Layout } from "lucide-react";

interface ChatInterfaceProps {
  onToggleVisualMode?: () => void;
}

const ChatInterface = ({ onToggleVisualMode }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items } = useContent();

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // TODO: Load session from database/localStorage
      // For now, generate a temporary session ID
      const id = `session-${Date.now()}`;
      setSessionId(id);
      
      // Add initial greeting
      const greeting: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Hello! I'm here to help you manage your content. You can create, view, edit, delete, or organize your content. What would you like to do?",
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    };

    loadSession();
  }, []);

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

    // Add user message
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Process message and generate response
      // For now, send a placeholder response
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: `I understood: "${input}". This feature is coming soon!`,
        timestamp: new Date().toISOString(),
      };

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: ChatMessageType = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
          content: "Chat history cleared. How can I help you?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Assistant</h1>
        <div className="flex gap-2">
          {onToggleVisualMode && (
            <Button
              variant="outline"
              onClick={onToggleVisualMode}
              className="text-sm"
            >
              Visual Mode
            </Button>
          )}
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

      {/* Messages area */}
      <ScrollArea className="flex-1 px-6 py-4 overflow-hidden">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <span className="text-xs opacity-70 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to do? (Create, view, edit, delete content...)"
            className="resize-none max-h-24"
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
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="border-t px-6 py-2 text-xs text-muted-foreground bg-muted/30">
          <p>Session: {sessionId} | User: {user?.email || "Guest"} | Items: {items.length}</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
