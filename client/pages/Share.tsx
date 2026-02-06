import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicContent } from "@/lib/api";
import { getGuestContentById } from "@/lib/localStorage";
import { ContentItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { ContentViewer } from "@/components/modals/ContentViewer";
import { ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export default function Share() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError("Invalid content ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Try to get guest content first (from localStorage)
        const guestContent = getGuestContentById(id);
        if (guestContent && guestContent.is_public) {
          setContent(guestContent);
          return;
        }

        // If not a guest local ID, try Supabase public content
        try {
          const data = await getPublicContent(id);
          setContent(data);
        } catch (supabaseErr) {
          // If both sources fail
          if (!guestContent) {
            throw new Error("Content not found");
          }
          // If guest content exists but not public
          throw new Error("Content is not public");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Content not found";
        setError(message);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleCopy = async () => {
    const textToCopy = content?.content || content?.file_url;
    if (textToCopy) {
      try {
        await copyToClipboard(textToCopy);
        toast.success("Copied to clipboard!");
      } catch {
        toast.error("Failed to copy");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Content not found
          </h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The content you are looking for does not exist or is not public."}
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">Public Content</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Title and Meta */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {content.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="capitalize bg-secondary px-2.5 py-1 rounded">
              {content.type}
            </span>
            {content.category && (
              <span className="bg-secondary px-2.5 py-1 rounded">
                {content.category}
              </span>
            )}
            <span>{new Date(content.created_at).toLocaleDateString()}</span>
            {content.word_count && <span>{content.word_count} words</span>}
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-card border border-border px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Content Display */}
        <div className="border border-border  bg-card p-6 sm:p-8 mb-8">
          {content.type === "image" && content.file_url && (
            <img
              src={content.file_url}
              alt={content.title}
              className="w-full  mb-4"
            />
          )}

          {content.type === "video" && content.file_url && (
            <video src={content.file_url} controls className="w-full  mb-4" />
          )}

          {content.type === "code" && (
            <pre className="bg-background p-4 rounded overflow-x-auto mb-4">
              <code className="text-sm font-mono text-foreground">
                {content.content}
              </code>
            </pre>
          )}

          {(content.type === "text" ||
            content.type === "prompt" ||
            content.type === "script") && (
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {content.content}
            </p>
          )}

          {content.type === "link" && content.content && (
            <a
              href={content.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all text-lg"
            >
              {content.content}
            </a>
          )}

          {content.type === "file" && content.file_url && (
            <a
              href={content.file_url}
              download={content.title}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground  hover:opacity-90 transition-opacity"
            >
              Download File
            </a>
          )}

          {content.type === "book" && (
            <div className="space-y-4">
              <p className="text-muted-foreground italic">
                Book view is not available in the public share view.
              </p>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button onClick={() => setShowViewer(true)} variant="outline">
            View Full Content
          </Button>
          {(content.content || content.file_url) && (
            <Button onClick={handleCopy} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          <p>
            Shared via{" "}
            <span className="font-semibold text-foreground">UZ-log</span>
          </p>
        </div>
      </main>

      {/* Content Viewer Modal */}
      <ContentViewer
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        content={content}
      />
    </div>
  );
}
