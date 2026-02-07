import { ChatMessage as ChatMessageType, ChatOption } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  options?: ChatOption[];
  onOptionSelect?: (value: string) => void;
  onCopy?: () => void;
}

export const ChatMessage = ({
  message,
  isLoading = false,
  options,
  onOptionSelect,
  onCopy,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-lg rounded-tr-none"
            : "bg-muted text-muted-foreground rounded-lg rounded-tl-none"
        }`}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Message Options */}
        {options && options.length > 0 && !isUser && (
          <div className="mt-3 space-y-2">
            {options.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left text-xs h-auto py-2"
                onClick={() => onOptionSelect?.(option.value)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs opacity-70">
                      {option.description}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Message Metadata */}
        <div className={`text-xs opacity-70 mt-2 flex justify-between items-center`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage;
