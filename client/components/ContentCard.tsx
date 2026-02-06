import React, { useState } from "react";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Share,
  Edit,
  Trash2,
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
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface ContentCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onShare: (item: ContentItem) => void;
  onDownload?: (item: ContentItem) => void;
}

const typeIcons = {
  text: <FileText className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  file: <File className="w-4 h-4" />,
  link: <LinkIcon className="w-4 h-4" />,
  prompt: <Zap className="w-4 h-4" />,
  script: <FileCode className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
};

const typeColors = {
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
  onEdit,
  onDelete,
  onShare,
  onDownload,
}) => {
  const [showActions, setShowActions] = useState(false);
  const wordCount = item.word_count || 0;
  const createdDate = new Date(item.created_at).toLocaleDateString();
  const createdTime = new Date(item.created_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const uploaderName = item.uploader_name || (item.user_id === "guest" ? "Anonymous" : "Unknown");
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
      className="group border border-border rounded-lg bg-card hover:shadow-md hover:border-foreground/20 transition-all duration-200 overflow-hidden flex flex-col h-full"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Type Badge */}
      <div className="px-3 pt-2 flex items-center justify-between gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[item.type]}`}
        >
          {typeIcons[item.type]}
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
        <div className="flex items-center gap-0.5">
          {item.user_id === "guest" ? (
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <HardDrive className="w-3 h-3" />
              Local
            </span>
          ) : (
            <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Cloud className="w-3 h-3" />
              Cloud
            </span>
          )}
          {item.is_public && (
            <span className="text-[10px] font-medium text-primary bg-secondary px-1.5 py-0.5 rounded">
              Public
            </span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className={`flex-1 px-3 ${item.type === "link" ? "py-0.5 min-h-0" : "py-2 min-h-[60px]"}`}>
        <h3 className={`font-semibold text-foreground line-clamp-2 ${item.type === "link" ? "mb-0.5 text-xs" : "mb-1.5 text-sm"}`}>
          {item.title}
        </h3>

        {/* Preview for certain types */}
        {item.type === "image" && item.file_url && (
          <div className="mt-1 mb-1">
            <img
              src={item.file_url}
              alt={item.title}
              className="w-full h-16 object-cover rounded border border-border"
            />
          </div>
        )}

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
      </div>

      {/* Metadata */}
      <div className="px-3 py-1.5 border-t border-border bg-secondary/30 text-xs text-muted-foreground space-y-0.5">
        <div className="flex justify-between items-center flex-wrap gap-1">
          <div className="flex flex-col gap-0">
            <span className="font-medium text-foreground text-[11px]">{uploaderName}</span>
            <span className="text-[10px]">{createdDate} at {createdTime}</span>
          </div>
          {wordCount > 0 && <span className="whitespace-nowrap">{wordCount} words</span>}
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
      </div>

      {/* Actions - Always visible on mobile, hover on desktop */}
      <div
        className={`px-3 py-1 border-t border-border bg-secondary/50 flex gap-1 transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
      >
        {(item.type === "text" ||
          item.type === "code" ||
          item.type === "prompt" ||
          item.type === "script") && (
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
          onClick={() => onDelete(item)}
          title="Delete"
          className="flex-1 h-7 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-2.5 h-2.5" />
          <span className="hidden sm:inline text-xs">Delete</span>
        </Button>
      </div>
    </div>
  );
};
