import React, { useState, useEffect } from "react";
import { ContentItem, ContentType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { AudioRecorder } from "@/components/AudioRecorder";
import { uploadFile } from "@/lib/api";
import { uploadGuestFile } from "@/lib/localStorage";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ContentItem>) => Promise<void>;
  initialData?: ContentItem;
}

const contentTypes: ContentType[] = [
  "text",
  "code",
  "image",
  "video",
  "file",
  "link",
  "prompt",
  "script",
  "book",
];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordedVoiceBlob, setRecordedVoiceBlob] = useState<Blob | null>(null);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showContentType, setShowContentType] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentItem>>(
    initialData || {
      type: "text",
      title: "",
      content: "",
      category: "",
      tags: [],
      is_public: false,
      status: "active",
    },
  );

  // Sync form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          type: "text",
          title: "",
          content: "",
          category: "",
          tags: [],
          is_public: false,
          status: "active",
        },
      );
      setSelectedFile(null);
      setRecordedVoiceBlob(null);
      setRecordedVoiceUrl(null);
      setRecordedVoiceDuration(0);
      setIsLoading(false);
      setIsUploading(false);
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (
      !formData.title?.trim() &&
      !formData.content?.trim() &&
      !selectedFile &&
      !initialData?.file_url // Allow saving if there's already a file (edit mode)
    ) {
      toast.error("Please enter a title, content, or upload a file");
      return;
    }

    setIsLoading(true);
    try {
      let dataToSave = { ...formData };

      // Handle file upload
      if (
        selectedFile &&
        (formData.type === "file" ||
          formData.type === "image" ||
          formData.type === "video")
      ) {
        setIsUploading(true);
        try {
          let fileUrl: string;

          if (isAuthenticated && user) {
            // Upload to Supabase for authenticated users
            fileUrl = await uploadFile(selectedFile, user.id);
          } else {
            // Store as base64 for guest users
            fileUrl = await uploadGuestFile(selectedFile);
          }

          dataToSave = {
            ...dataToSave,
            file_url: fileUrl,
            file_size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
            title: dataToSave.title || selectedFile.name,
          };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Upload failed";
          toast.error(`File upload failed: ${errorMsg}`);
          setIsUploading(false);
          setIsLoading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Handle voice attachment upload for text-based content
      if (recordedVoiceBlob && (formData.type === "text" || formData.type === "code" || formData.type === "prompt" || formData.type === "script")) {
        setIsUploading(true);
        try {
          const voiceFile = new File([recordedVoiceBlob], "voice.webm", {
            type: "audio/webm",
          });

          let voiceUrl: string;

          if (isAuthenticated && user) {
            // Upload to Supabase for authenticated users
            voiceUrl = await uploadFile(voiceFile, user.id);
          } else {
            // Store as base64 for guest users
            voiceUrl = await uploadGuestFile(voiceFile);
          }

          dataToSave = {
            ...dataToSave,
            voice_url: voiceUrl,
          };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Upload failed";
          toast.error(`Voice attachment upload failed: ${errorMsg}`);
          setIsUploading(false);
          setIsLoading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await onSave(dataToSave);
      toast.success(initialData ? "Content updated" : "Content created");
      setSelectedFile(null);
      setRecordedVoiceBlob(null);
      setRecordedVoiceUrl(null);
      setRecordedVoiceDuration(0);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Content" : "Create New Content"}
          </DialogTitle>
          <DialogDescription>Fill in the details below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection - Collapsible */}
          <div className="text-center space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Content Type
            </label>
            <div className="flex justify-center">
              <button
                onClick={() => setShowContentType(!showContentType)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                title={
                  showContentType ? "Hide content types" : "Show content types"
                }
              >
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-200"
                  style={{
                    transform: showContentType
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {showContentType && (
              <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-200">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                      formData.type === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title - Collapsible */}
          <div className="text-center space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Title (optional)
            </label>
            <div className="flex justify-center">
              <button
                onClick={() => setShowTitle(!showTitle)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                title={showTitle ? "Hide title" : "Show title"}
              >
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-200"
                  style={{
                    transform: showTitle ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>

            {showTitle && (
              <div className="animate-in fade-in duration-200">
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Leave empty for auto-generated title"
                />
              </div>
            )}
          </div>

          {/* File Upload for certain types */}
          {(formData.type === "file" ||
            formData.type === "image" ||
            formData.type === "video") && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Upload File
              </label>
              <FileUpload
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onFileRemove={() => setSelectedFile(null)}
                isUploading={isUploading}
              />
              {!isAuthenticated && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Note: Files are stored locally in your browser. Sign in to
                  upload to cloud storage.
                </p>
              )}
            </div>
          )}


          {/* Content */}
          {formData.type === "link" ? (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                URL
              </label>
              <Input
                type="url"
                value={formData.content || ""}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
          ) : formData.type !== "file" &&
            formData.type !== "image" &&
            formData.type !== "video" ? (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Content
              </label>
              <textarea
                value={formData.content || ""}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Enter your content here..."
                className="w-full min-h-[500px] px-3 py-2 rounded border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
              />
              {formData.content && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.content.split(/\s+/).length} words
                </p>
              )}
            </div>
          ) : null}

          {/* Additional Fields */}
          <Tabs defaultValue="metadata" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-3 mt-3">
              {/* Voice Attachment for text-based content */}
              {(formData.type === "text" ||
                formData.type === "code" ||
                formData.type === "prompt" ||
                formData.type === "script") && (
                <div>
                  <div className="text-center space-y-2">
                    <label className="text-sm font-medium text-foreground block">
                      Add Voice Attachment
                    </label>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowVoice(!showVoice)}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                        title={showVoice ? "Hide voice" : "Show voice"}
                      >
                        <ChevronDown
                          className="w-5 h-5 transition-transform duration-200"
                          style={{
                            transform: showVoice
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {showVoice && (
                    <div className="animate-in fade-in duration-200">
                      <AudioRecorder
                        onAudioRecorded={(blob, duration) => {
                          setRecordedVoiceBlob(blob);
                          setRecordedVoiceDuration(duration);
                          const url = URL.createObjectURL(blob);
                          setRecordedVoiceUrl(url);
                        }}
                        onAudioRemove={() => {
                          setRecordedVoiceBlob(null);
                          setRecordedVoiceUrl(null);
                          setRecordedVoiceDuration(0);
                        }}
                        recordedAudioUrl={recordedVoiceUrl || undefined}
                        recordedDuration={recordedVoiceDuration}
                      />
                      {!isAuthenticated && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          Note: Voice attachment is stored locally in your browser. Sign in to upload to cloud storage.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Category - Collapsible */}
              <div className="text-center space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Category
                </label>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowCategory(!showCategory)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                    title={showCategory ? "Hide category" : "Show category"}
                  >
                    <ChevronDown
                      className="w-5 h-5 transition-transform duration-200"
                      style={{
                        transform: showCategory
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                </div>

                {showCategory && (
                  <div className="animate-in fade-in duration-200">
                    <Input
                      value={formData.category || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g., Work, Personal, Ideas"
                    />
                  </div>
                )}
              </div>

              {/* Tags - Collapsible */}
              <div className="text-center space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Tags (comma-separated)
                </label>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowTags(!showTags)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                    title={showTags ? "Hide tags" : "Show tags"}
                  >
                    <ChevronDown
                      className="w-5 h-5 transition-transform duration-200"
                      style={{
                        transform: showTags ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                </div>

                {showTags && (
                  <div className="animate-in fade-in duration-200">
                    <Input
                      value={formData.tags?.join(", ") || ""}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="e.g., important, urgent, review"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-3 mt-3">
              <div className="flex items-center justify-between p-3 rounded border border-border bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Public</p>
                  <p className="text-xs text-muted-foreground">
                    Anyone with the link can view
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_public || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_public: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
