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

  const loadShareLinks = async () => {
    if (!isAuthenticated) return;
    try {
      const links = await getShareLinks(item.id);
      setShareLinks(links);
    } catch (error) {
      console.error("Failed to load share links:", error);
    }
  };

  const handleCreateShareLink = async () => {
    if (!isAuthenticated) {
      toast.error("Sign in to create custom share links");
      return;
    }

    setIsCreatingLink(true);
    try {
      const expiresIn = expirationDays ? parseInt(expirationDays) : undefined;
      await createShareLink(item.id, {
        password: password || undefined,
        expiresIn,
      });
      toast.success("Share link created");
      setPassword("");
      setExpirationDays("");
      setShowLinkForm(false);
      await loadShareLinks();
    } catch (error) {
      toast.error("Failed to create share link");
      console.error(error);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDeleteShareLink = async (linkId: string) => {
    try {
      await deleteShareLink(linkId);
      toast.success("Share link deleted");
      await loadShareLinks();
    } catch (error) {
      toast.error("Failed to delete link");
      console.error(error);
    }
  };

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

          {/* Advanced Share Links */}
          {isAuthenticated && !isLocalContent && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Custom Share Links</h3>
                {!showLinkForm && (
                  <Button
                    onClick={() => setShowLinkForm(true)}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create
                  </Button>
                )}
              </div>

              {/* Create Link Form */}
              {showLinkForm && (
                <div className="space-y-3 p-3 bg-secondary/20 rounded">
                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Password (optional)
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Expires in (days)
                    </label>
                    <Input
                      type="number"
                      placeholder="Leave empty for no expiration"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(e.target.value)}
                      className="h-7 text-xs"
                      min="1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateShareLink}
                      disabled={isCreatingLink}
                      className="flex-1 h-7 text-xs"
                    >
                      Create Link
                    </Button>
                    <Button
                      onClick={() => {
                        setShowLinkForm(false);
                        setPassword("");
                        setExpirationDays("");
                      }}
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Share Links List */}
              {shareLinks.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {shareLinks.map((link) => {
                    const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                    const linkUrl = `${window.location.origin}/s/${link.token}`;

                    return (
                      <div
                        key={link.id}
                        className={`p-2 rounded border text-xs ${
                          isExpired
                            ? "bg-destructive/5 border-destructive/30"
                            : "bg-secondary/30 border-border"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {link.password && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                Protected
                              </span>
                            )}
                            {link.expires_at && (
                              <span className={`flex items-center gap-1 ${
                                isExpired ? "text-destructive" : "text-muted-foreground"
                              }`}>
                                <Clock className="w-3 h-3" />
                                {isExpired ? "Expired" : `Expires ${new Date(link.expires_at).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={linkUrl}
                              readOnly
                              className="flex-1 text-xs border rounded px-2 py-1 bg-background"
                            />
                            <button
                              onClick={() => copyToClipboard(linkUrl)}
                              className="p-1 hover:bg-primary/20 rounded transition-colors"
                              title="Copy link"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteShareLink(link.id)}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors"
                              title="Delete link"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {shareLinks.length === 0 && !showLinkForm && (
                <p className="text-xs text-muted-foreground">
                  No custom share links yet. Create one to get started.
                </p>
              )}
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
