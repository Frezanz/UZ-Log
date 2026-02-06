import React, { useState } from "react";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { X, Download, Share, Heart } from "lucide-react";
import { toast } from "sonner";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  image: ContentItem | null;
  onShare?: (item: ContentItem) => void;
  onDownload?: (item: ContentItem) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  image,
  onShare,
  onDownload,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showUI, setShowUI] = useState(true);

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

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="h-full flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/20 transition-all duration-300 ${
            showUI ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          title="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Image Section - Edge-to-Edge Full Screen */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-black">
          <img
            src={image.file_url}
            alt={image.title}
            className="w-full h-full object-contain cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowUI(!showUI);
            }}
          />
        </div>

        {/* Details Section - Instagram/Facebook Style, Flexible Scrolling */}
        <div
          className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-y-auto"
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

          {/* Description/Content Area - Flexible Scrolling */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {/* File Size */}
            {image.file_size && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  File Size
                </p>
                <p className="text-sm text-muted-foreground">
                  {image.file_size}
                </p>
              </div>
            )}

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Tags
                </p>
                <div className="flex gap-2 flex-wrap">
                  {image.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visibility Status */}
            {image.is_public && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Sharing Status
                </p>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    This image is publicly shared
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Section - Instagram Style */}
          <div className="px-4 py-4 border-t border-border space-y-3 flex-shrink-0">
            {/* Like Button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                isLiked
                  ? "bg-red-500 dark:bg-red-600 text-white shadow-lg"
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{isLiked ? "Liked" : "Like Image"}</span>
            </button>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 h-10"
                title="Download image"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 h-10"
                title="Share image"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>

            {/* Click to Close Hint */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Press ESC or click outside to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
