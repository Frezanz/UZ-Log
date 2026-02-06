import React, { useState } from "react";
import { ContentItem, ContentType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { uploadFile } from "@/lib/api";
import { getCurrentUser } from "@/lib/api";
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showContentType, setShowContentType] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentItem>>(
    initialData || {
      type: "text",
      title: "",
      content: "",
      category: "",
      tags: [],
      is_public: false,
    },
  );

  const handleSave = async () => {
    if (!formData.title?.trim() && !formData.content?.trim() && !selectedFile) {
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
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        const fileUrl = await uploadFile(selectedFile, user.id);
        dataToSave = {
          ...dataToSave,
          file_url: fileUrl,
          file_size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          title: dataToSave.title || selectedFile.name,
        };
        setIsUploading(false);
      }

      await onSave(dataToSave);
      toast.success(initialData ? "Content updated" : "Content created");
      setSelectedFile(null);
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

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Title (optional)
            </label>
            <Input
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Leave empty for auto-generated title"
            />
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
              {/* Category - Collapsible */}
              <div className="text-center space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Category
                </label>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowCategory(!showCategory)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none p-2 active:bg-transparent active:text-foreground"
                    title={
                      showCategory ? "Hide category" : "Show category"
                    }
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
                    title={
                      showTags ? "Hide tags" : "Show tags"
                    }
                  >
                    <ChevronDown
                      className="w-5 h-5 transition-transform duration-200"
                      style={{
                        transform: showTags
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
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
