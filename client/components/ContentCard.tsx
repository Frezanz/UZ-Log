import React, { useState } from "react";
import { ContentItem, ContentType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusDropdown } from "@/components/StatusSelect";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import {
  Copy,
  Download,
  Share,
  Edit,
  CopyPlus,
  FileText,
  Code,
  Image,
  Video,
  File,
  Link as LinkIcon,
  Zap,
  FileCode,
  BookOpen,
  HardDrive,
  Cloud,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface ContentCardProps {
  item: ContentItem;
  onView?: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onShare: (item: ContentItem) => void;
  onDuplicate?: (item: ContentItem) => void;
  onStatusChange?: (
    id: string,
    status: "active" | "pending" | "completed",
  ) => void;
  onDownload?: (item: ContentItem) => void;
}

const typeIcons: Record<ContentType, React.ReactNode> = {
  text: <FileText className="w-3 h-3" />,
  code: <Code className="w-3 h-3" />,
  image: <Image className="w-3 h-3" />,
  video: <Video className="w-3 h-3" />,
  file: <File className="w-3 h-3" />,
  link: <LinkIcon className="w-3 h-3" />,
  prompt: <Zap className="w-3 h-3" />,
  script: <FileCode className="w-3 h-3" />,
  book: <BookOpen className="w-3 h-3" />,
};

const typeColors: Record<ContentType, string> = {
  text: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  code: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
  image: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
  video: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
  file: "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  link: "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300",
  prompt: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  script:
    "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
  book: "bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300",
};

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onView,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  onStatusChange,
  onDownload,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const wordCount = item.word_count || 0;
  const createdDate = new Date(item.created_at).toLocaleDateString();
  const createdTime = new Date(item.created_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const uploaderName =
    item.uploader_name || (item.user_id === "guest" ? "Anonymous" : "Unknown");
  const preview = item.content?.slice(0, 120)?.trim() || "No preview available";

  const handleCopy = async () => {
    try {
      await copyToClipboard(item.content || item.file_url || "");
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className="group border border-border rounded-lg bg-card hover:shadow-md hover:border-foreground/20 transition-all duration-200 overflow-hidden flex flex-col h-full cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView?.(item)}
    >
      {/* Type Badge */}
      <div
        className="px-3 pt-2 pl-9 flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[item.type]}`}
        >
          {typeIcons[item.type]}
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
        <div className="flex items-center gap-0.5">
          {item.user_id === "guest" ? (
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <HardDrive className="w-2.5 h-2.5" />
              Local
            </span>
          ) : (
            <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Cloud className="w-2.5 h-2.5" />
              Cloud
            </span>
          )}
          {item.is_public && (
            <span className="text-[10px] font-medium text-primary bg-secondary px-1.5 py-0.5 rounded">
              Public
            </span>
          )}
          <StatusDropdown
            status={item.status}
            onChange={(newStatus) => onStatusChange?.(item.id, newStatus)}
          />
        </div>
      </div>

      {/* Image - Instagram Style Full Width Preview */}
      {item.type === "image" && item.file_url && (
        <div className="w-full aspect-square overflow-hidden bg-secondary">
          <img
            src={item.file_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Preview */}
      <div
        className={`flex-1 px-3 ${item.type === "link" ? "py-0.5 min-h-0" : "py-2 min-h-[60px]"}`}
      >
        <h3
          className={`font-semibold text-foreground line-clamp-2 ${item.type === "link" ? "mb-0.5 text-xs" : "mb-1.5 text-sm"}`}
        >
          {item.title}
        </h3>

        {(item.type === "text" ||
          item.type === "code" ||
          item.type === "prompt" ||
          item.type === "script") && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-tight">
            {preview}
          </p>
        )}

        {item.type === "link" && item.content && (
          <a
            href={item.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline break-all line-clamp-2 inline-block"
            title={item.content}
          >
            {item.content}
          </a>
        )}

        {item.category && (
          <div className="mt-1">
            <span className="inline-block text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
              {item.category}
            </span>
          </div>
        )}

        {item.voice_url && (
          <div className="mt-1">
            <span className="inline-block text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded font-medium">
              Has Voice
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="px-3 py-1.5 border-t border-border bg-secondary/30 text-xs text-muted-foreground space-y-0.5">
        <div className="flex justify-between items-center flex-wrap gap-1">
          <div className="flex flex-col gap-0">
            <span className="font-medium text-foreground text-[11px]">
              {uploaderName}
            </span>
            <span className="text-[10px]">
              {createdDate} at {createdTime}
            </span>
          </div>
          {wordCount > 0 && (
            <span className="whitespace-nowrap">{wordCount} words</span>
          )}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="flex gap-0.5 flex-wrap">
            {item.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="bg-card px-1 py-0 rounded text-[9px] border border-border"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[9px]">+{item.tags.length - 2}</span>
            )}
          </div>
        )}
        {item.auto_delete_enabled && item.auto_delete_at && (
          <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
            Will auto-delete:{" "}
            {new Date(item.auto_delete_at).toLocaleDateString()} at{" "}
            {new Date(item.auto_delete_at).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* Actions - Always visible on mobile, hover on desktop */}
      <div
        className={`px-3 py-1 border-t border-border bg-secondary/50 flex gap-2 transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex-wrap`}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          title={isLiked ? "Unlike" : "Like"}
          className={`flex-1 h-7 ${
            isLiked ? "text-red-500 dark:text-red-400" : ""
          }`}
        >
          <Heart className={`w-2.5 h-2.5 ${isLiked ? "fill-current" : ""}`} />
          <span className="hidden sm:inline text-xs">Like</span>
        </Button>

        {(item.content || item.file_url) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Copy content"
            className="flex-1 h-7"
          >
            <Copy className="w-2.5 h-2.5" />
            <span className="hidden sm:inline text-xs">Copy</span>
          </Button>
        )}

        {item.content &&
          (item.type === "text" ||
            item.type === "code" ||
            item.type === "prompt" ||
            item.type === "script") && (
            <div className="flex-1 h-7 flex items-center justify-center">
              <TextToSpeechButton
                text={item.content}
                contentType={item.type}
                variant="ghost"
                size="sm"
                showLabel={false}
              />
            </div>
          )}

        {item.file_url && item.type !== "image" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload?.(item)}
            title="Download"
            className="flex-1 h-7"
          >
            <Download className="w-2.5 h-2.5" />
            <span className="hidden sm:inline text-xs">Download</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(item)}
          title="Share"
          className="flex-1 h-7"
        >
          <Share className="w-2.5 h-2.5" />
          <span className="hidden sm:inline text-xs">Share</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          title="Edit"
          className="flex-1 h-7"
        >
          <Edit className="w-2.5 h-2.5" />
          <span className="hidden sm:inline text-xs">Edit</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate?.(item)}
          title="Duplicate"
          className="flex-1 h-7"
        >
          <CopyPlus className="w-2.5 h-2.5" />
          <span className="hidden sm:inline text-xs">Duplicate</span>
        </Button>
      </div>
    </div>
  );
};
