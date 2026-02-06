import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ContentItem, ShareLink } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Share2, AlertCircle, MoreHorizontal, Lock, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { createShareLink, getShareLinks, deleteShareLink } from "@/lib/api";

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
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [expirationDays, setExpirationDays] = useState<string>("");
  const [password, setPassword] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  useEffect(() => {
    if (item && isAuthenticated && isOpen) {
      loadShareLinks();
    }
  }, [item, isAuthenticated, isOpen]);

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
    if (!item.is_public) {
      toast.error("Make content public to share");
      return;
    }

    // Capture user gesture immediately
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out this content on UZ-log: ${item.title}`,
          url: shareUrl,
        });
        return;
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.warn("Native share restricted:", error);
      }
    }

    // Fallback: Copy to clipboard if API is missing or blocked (e.g. in iframe)
    try {
      await copyToClipboard(shareUrl);
      toast.success("Link copied! (Native share is blocked in previews)");
    } catch (err) {
      toast.error("Failed to copy link");
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
          {/* Storage Type Info */}
          {isLocalContent && (
            <div className="p-3 rounded-lg border border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                    Local Browser Storage
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                    This content is stored locally in your browser. You can
                    share it via link right now, or sign in to sync across
                    devices and use cloud storage.
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleNativeShare}
                title={
                  item.is_public
                    ? "Share to other apps"
                    : "Make content public to share"
                }
              >
                <Share2 className="w-4 h-4 mr-1" />
                More
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-card border border-border p-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {item.is_public
                    ? "This content is public. Anyone with the link can view it."
                    : "Make content public to enable sharing."}
                </p>
              </div>
              {window.self !== window.top && (
                <p className="text-[10px] text-muted-foreground italic mt-1 border-t border-border pt-2">
                  Tip: Some share features are blocked in previews. Open the app
                  directly to use the native share menu.
                </p>
              )}
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
