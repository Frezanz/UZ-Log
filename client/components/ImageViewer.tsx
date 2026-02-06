import React, { useState } from "react";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { X, Download, Share, Heart, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  image: ContentItem | null;
  onShare?: (item: ContentItem) => void;
  onDownload?: (item: ContentItem) => void;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  image,
  onShare,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  // Handle ESC key to close viewer
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !image || !image.file_url) return null;

  const createdDate = new Date(image.created_at).toLocaleDateString();
  const createdTime = new Date(image.created_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = () => {
    if (onDownload) {
      onDownload(image);
    } else {
      const link = document.createElement("a");
      link.href = image.file_url;
      link.download = image.title || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading...");
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(image);
    } else {
      toast.info("Share feature not available");
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(image);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(image);
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="h-full flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <img
            src={image.file_url}
            alt={image.title}
            className="max-h-full max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Details Section - Instagram/Facebook Style */}
        <div
          className="w-full md:w-96 bg-card flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with User Info */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {image.uploader_name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {createdDate} at {createdTime}
                </p>
              </div>
              <div className="text-right">
                {image.user_id === "guest" ? (
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded">
                    Local
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded">
                    Cloud
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Title and Category */}
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {image.title}
            </h2>
            {image.category && (
              <div className="inline-block">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {image.category}
                </span>
              </div>
            )}
          </div>

          {/* Description/Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 border-b border-border">
            {/* File Size */}
            {image.file_size && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">File Size</p>
                <p className="text-sm font-medium text-foreground">
                  {image.file_size}
                </p>
              </div>
            )}

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {image.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visibility Status */}
            {image.is_public && (
              <div className="mb-3">
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    This image is publicly shared
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Engagement Section - Instagram Style */}
          <div className="px-4 py-3 border-t border-border space-y-3">
            {/* Like Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors flex-1 justify-center ${
                  isLiked
                    ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-medium">
                  {isLiked ? "Liked" : "Like"}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center justify-center gap-1"
                title="Download image"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center justify-center gap-1"
                title="Share image"
              >
                <Share className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center justify-center gap-1"
                title="Edit details"
                disabled={!onEdit}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>

            {/* Delete Button */}
            {onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Image
              </Button>
            )}

            {/* Click to Close Hint */}
            <p className="text-center text-xs text-muted-foreground">
              Click outside or press ESC to close
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard support - ESC to close */}
      {isOpen && (
        <div
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onClose();
            }
          }}
          tabIndex={-1}
        />
      )}
    </div>
  );
};
