import React, { useState, useMemo } from "react";
import { ContentItem, ContentType } from "@/types/content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Download,
  FileText,
  Code,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  Link as LinkIcon,
  Zap,
  FileCode,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { SyntaxErrorDisplay } from "@/components/SyntaxErrorDisplay";
import { analyzeSyntax } from "@/lib/syntaxChecker";
import { ImageViewer } from "@/components/ImageViewer";

interface ContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
  onShare?: (item: ContentItem) => void;
}

const typeIcons: Record<ContentType, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  video: <VideoIcon className="w-4 h-4" />,
  file: <File className="w-4 h-4" />,
  link: <LinkIcon className="w-4 h-4" />,
  prompt: <Zap className="w-4 h-4" />,
  script: <FileCode className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
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

export const ContentViewer: React.FC<ContentViewerProps> = ({
  isOpen,
  onClose,
  content,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Analyze syntax for code/text content
  const syntaxAnalysis = useMemo(() => {
    if (!content || !content.content) return null;

    const codeTypes: ContentType[] = ["code", "script", "text", "prompt"];
    if (codeTypes.includes(content.type)) {
      return analyzeSyntax(content.content);
    }
    return null;
  }, [content]);

  if (!content) return null;

  // Handle image viewing - open fullscreen viewer instead of dialog
  if (content.type === "image" && content.file_url) {
    return (
      <ImageViewer
        isOpen={isOpen}
        onClose={onClose}
        image={content}
        onShare={onShare}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  const handleDownload = () => {
    if (content.file_url) {
      const link = document.createElement("a");
      link.href = content.file_url;
      link.download = content.title || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading...");
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(content.content || content.file_url || "");
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (content.file_url) {
      const link = document.createElement("a");
      link.href = content.file_url;
      link.download = content.title || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading...");
    }
  };

  const createdDate = new Date(content.created_at).toLocaleDateString();
  const createdTime = new Date(content.created_at).toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeColors[content.type]}`}
            >
              {typeIcons[content.type]}
              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
            </span>
            {content.is_public && (
              <span className="text-xs font-medium text-primary bg-secondary px-2 py-1 rounded">
                Public
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          <DialogDescription className="mt-2 text-xs text-muted-foreground">
            {content.uploader_name} • {createdDate} at {createdTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Viewer */}
          {content.type === "image" && content.file_url && (
            <div className="flex justify-center bg-secondary/50 rounded-lg p-4 max-h-[60vh] overflow-auto">
              <img
                src={content.file_url}
                alt={content.title}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          )}

          {/* Video Viewer */}
          {content.type === "video" && content.file_url && (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full max-h-[60vh]"
                controlsList="nodownload"
              >
                <source src={content.file_url} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Text Viewer */}
          {content.type === "text" && content.content && (
            <div className="space-y-3">
              {syntaxAnalysis && (
                <SyntaxErrorDisplay result={syntaxAnalysis} compact={true} />
              )}
              <div className="bg-secondary/30 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <pre className="font-sans whitespace-pre-wrap break-words text-foreground text-sm leading-relaxed cursor-text select-text">
                  {content.content}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Select the text above to copy it</span>
              </div>
              {content.voice_url && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Voice Attachment
                  </p>
                  <audio controls className="w-full" controlsList="nodownload">
                    <source src={content.voice_url} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Code Viewer */}
          {content.type === "code" && content.content && (
            <div className="space-y-3">
              {syntaxAnalysis && (
                <SyntaxErrorDisplay result={syntaxAnalysis} compact={true} />
              )}
              <div className="bg-secondary/30 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words cursor-text select-text">
                  {content.content}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Select the code above to copy it</span>
              </div>
              {content.voice_url && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Voice Attachment
                  </p>
                  <audio controls className="w-full" controlsList="nodownload">
                    <source src={content.voice_url} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Prompt Viewer */}
          {content.type === "prompt" && content.content && (
            <div className="space-y-3">
              {syntaxAnalysis && (
                <SyntaxErrorDisplay result={syntaxAnalysis} compact={true} />
              )}
              <div className="bg-secondary/30 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <pre className="font-sans whitespace-pre-wrap break-words text-foreground text-sm leading-relaxed cursor-text select-text">
                  {content.content}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Select the prompt above to copy it</span>
              </div>
              {content.voice_url && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Voice Attachment
                  </p>
                  <audio controls className="w-full" controlsList="nodownload">
                    <source src={content.voice_url} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Script Viewer */}
          {content.type === "script" && content.content && (
            <div className="space-y-3">
              {syntaxAnalysis && (
                <SyntaxErrorDisplay result={syntaxAnalysis} compact={true} />
              )}
              <div className="bg-secondary/30 rounded-lg p-4 max-h-[60vh] overflow-auto">
                <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words cursor-text select-text">
                  {content.content}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Select the script above to copy it</span>
              </div>
              {content.voice_url && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Voice Attachment
                  </p>
                  <audio controls className="w-full" controlsList="nodownload">
                    <source src={content.voice_url} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          {/* Link Viewer */}
          {content.type === "link" && content.content && (
            <div className="bg-secondary/30 rounded-lg p-4">
              <a
                href={content.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all text-sm"
              >
                {content.content}
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Click the link above to open it in a new tab
              </p>
            </div>
          )}

          {/* File Viewer */}
          {content.type === "file" && content.file_url && (
            <div className="bg-secondary/30 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">
                  File available for download
                </p>
                {content.file_size && (
                  <p className="text-xs text-muted-foreground">
                    Size: {content.file_size}
                  </p>
                )}
              </div>
              <Button onClick={handleDownload} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          {/* Content Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {content.category && (
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">
                  {content.category}
                </p>
              </div>
            )}
            {content.word_count &&
              (content.type === "text" ||
                content.type === "code" ||
                content.type === "prompt" ||
                content.type === "script") && (
                <div>
                  <p className="text-xs text-muted-foreground">Word Count</p>
                  <p className="font-medium text-foreground">
                    {content.word_count} words
                  </p>
                </div>
              )}
            {content.tags && content.tags.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {content.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-secondary px-2 py-1 rounded text-xs border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-border flex-wrap">
          {(content.content || content.file_url) && (
            <Button variant="outline" onClick={handleCopy} size="sm">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
          {content.content &&
            (content.type === "text" ||
              content.type === "code" ||
              content.type === "prompt" ||
              content.type === "script") && (
              <TextToSpeechButton
                text={content.content}
                contentType={content.type}
                variant="outline"
                size="sm"
                showLabel={true}
              />
            )}
          {content.file_url && content.type !== "image" && (
            <Button variant="outline" onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onEdit(content);
                onClose();
              }}
              size="sm"
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => {
                onDelete(content);
                onClose();
              }}
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
