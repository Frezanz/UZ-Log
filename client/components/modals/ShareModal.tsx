import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Share2, AlertCircle, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onTogglePublic: (item: ContentItem, isPublic: boolean) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  onTogglePublic,
}) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isLocalContent = item.user_id === "guest";
  const shareUrl = `${window.location.origin}/share/${item.id}`;

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      await onTogglePublic(item, !item.is_public);
      toast.success(
        item.is_public ? "Content made private" : "Content is now public!",
      );
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update sharing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    // Immediate feedback to prove the click was registered
    const shareToast = toast.loading("Preparing share menu...");

    try {
      if (!item.is_public) {
        toast.error("Make content public to share", { id: shareToast });
        return;
      }

      // Check if Web Share API is available
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: item.title,
            text: `Check out this content on UZ-log: ${item.title}`,
            url: shareUrl,
          });
          toast.dismiss(shareToast);
          return;
        } catch (error: any) {
          if (error.name === "AbortError") {
            toast.dismiss(shareToast);
            return;
          }
          console.error("Native share failed:", error);
          // Don't return, fall through to fallback
        }
      }

      // Fallback: Copy to clipboard if native share is missing or fails
      try {
        await copyToClipboard(shareUrl);
        toast.success("Link copied! (Native share unavailable)", {
          id: shareToast,
        });
      } catch (copyError) {
        toast.error("Failed to share or copy link", { id: shareToast });
      }
    } catch (err: any) {
      console.error("Critical share error:", err);
      toast.error("An unexpected error occurred", { id: shareToast });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
          <DialogDescription>
            Share "{item.title}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Storage Type Warning */}
          {isLocalContent && (
            <div className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                    Local Browser Storage
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    This content is stored locally in your browser. Sign in to
                    sync across devices and share publicly on the cloud.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/50">
            <div>
              <p className="font-medium text-foreground text-sm">
                Public Sharing
              </p>
              <p className="text-xs text-muted-foreground">
                {item.is_public
                  ? "Anyone with the link can view"
                  : "Currently private"}
              </p>
            </div>
            <Button
              onClick={handleTogglePublic}
              disabled={isLoading}
              variant={item.is_public ? "default" : "outline"}
            >
              {item.is_public ? "Public" : "Private"}
            </Button>
          </div>

          {/* Share Link */}
          {item.is_public && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Share Methods */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Share via</p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this content on UZ-log: ${item.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-3 py-2 rounded border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium ${
                  !item.is_public ? "opacity-50" : ""
                }`}
                onClick={(e) => {
                  if (!item.is_public) {
                    e.preventDefault();
                    toast.error("Make content public to share");
                  }
                }}
              >
                Twitter
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(`I wanted to share this with you: ${shareUrl}`)}`}
                className="inline-flex items-center justify-center px-3 py-2 rounded border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium"
              >
                Email
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className={`w-full inline-flex items-center justify-center px-3 py-2 rounded border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium ${
                  !item.is_public ? "opacity-50" : ""
                }`}
                title={
                  item.is_public
                    ? "Share to other apps"
                    : "Make content public to share"
                }
              >
                <MoreHorizontal className="w-4 h-4 mr-1" />
                More
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-card border border-border rounded p-3">
            <div className="flex gap-2">
              <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {item.is_public
                  ? "This content is public. Anyone with the link can view it."
                  : "Make content public to enable sharing."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
