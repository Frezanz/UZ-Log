import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContentItem } from "@/types/content";
import { getSharedContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentViewer } from "@/components/modals/ContentViewer";
import { Copy, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export default function SharedContent() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSharedContent();
  }, [token]);

  const loadSharedContent = async (pwd?: string) => {
    if (!token) {
      setError("Invalid share link");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const sharedContent = await getSharedContent(token, pwd);
      setContent(sharedContent);
      setIsPasswordRequired(false);
      setPassword("");
      setShowViewer(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load shared content";
      
      if (errorMessage.includes("password")) {
        setIsPasswordRequired(true);
        setError(null);
      } else if (errorMessage.includes("not found")) {
        setError("Share link not found or has been deleted");
      } else if (errorMessage.includes("expired")) {
        setError("This share link has expired");
      } else {
        setError(errorMessage || "Failed to load content");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    loadSharedContent(password);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading && !isPasswordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    );
  }

  // Password required state
  if (isPasswordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full border border-border rounded-lg shadow-lg p-6 bg-card space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Lock className="w-5 h-5" />
            Password Protected
          </div>
          <p className="text-sm text-muted-foreground">
            This shared content is password protected. Please enter the password to view it.
          </p>

          <form onSubmit={handleSubmitPassword} className="space-y-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="h-10"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!password}
              >
                View Content
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Back
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full border border-destructive/30 rounded-lg shadow-lg p-6 bg-destructive/5 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <AlertCircle className="w-5 h-5" />
            Share Link Error
          </div>
          <p className="text-sm text-destructive/80">{error}</p>
          <Button onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Content loaded
  if (content) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-semibold text-foreground truncate">
                  {content.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Shared by {content.uploader_name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button
                onClick={() => setShowViewer(true)}
                className="gap-2"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            {/* Type Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                Shared on {new Date(content.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Content Preview */}
            {content.type === "text" && content.content && (
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {content.content.slice(0, 500)}
                  {content.content.length > 500 && "..."}
                </p>
              </div>
            )}

            {content.type === "code" && content.content && (
              <div className="bg-secondary/50 rounded p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-foreground">
                  {content.content.slice(0, 500)}
                  {content.content.length > 500 && "..."}
                </pre>
              </div>
            )}

            {content.type === "image" && content.file_url && (
              <img
                src={content.file_url}
                alt={content.title}
                className="max-w-full h-auto rounded border border-border max-h-96"
              />
            )}

            {content.type === "link" && content.content && (
              <a
                href={content.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {content.content}
              </a>
            )}

            {content.type === "file" && content.file_url && (
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded border border-border">
                <div>
                  <p className="font-medium text-foreground">{content.title}</p>
                  {content.file_size && (
                    <p className="text-xs text-muted-foreground">
                      Size: {content.file_size}
                    </p>
                  )}
                </div>
                <a
                  href={content.file_url}
                  download={content.title}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90"
                >
                  Download
                </a>
              </div>
            )}

            {/* Metadata */}
            {(content.category || content.tags?.length > 0 || content.word_count) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                {content.category && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="text-sm font-medium text-foreground">
                      {content.category}
                    </p>
                  </div>
                )}
                {content.word_count && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Word Count</p>
                    <p className="text-sm font-medium text-foreground">
                      {content.word_count} words
                    </p>
                  </div>
                )}
                {content.tags?.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex gap-1 flex-wrap">
                      {content.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-secondary px-2 py-1 text-xs border border-border rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={() => setShowViewer(true)}
                className="w-full"
              >
                View Full Content
              </Button>
            </div>
          </div>
        </div>

        {/* Full Content Viewer Modal */}
        <ContentViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          content={content}
          allContent={[content]}
        />
      </div>
    );
  }

  return null;
}
