import React, { useState, useEffect } from "react";
import { ContentItem, ContentLink, LinkType } from "@/types/content";
import { Button } from "@/components/ui/button";
import { getLinksForContent, getBacklinksForContent, createLink, deleteLink } from "@/lib/api";
import { Link as LinkIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface ContentLinksProps {
  content: ContentItem;
  allContent: ContentItem[];
  onUpdate?: () => void;
}

const linkTypeLabels: Record<LinkType, string> = {
  "references": "References",
  "referenced-by": "Referenced by",
  "related-to": "Related to",
  "generates": "Generates",
  "depends-on": "Depends on",
  "solves": "Solves",
};

export const ContentLinks: React.FC<ContentLinksProps> = ({
  content,
  allContent,
  onUpdate,
}) => {
  const [links, setLinks] = useState<ContentLink[]>([]);
  const [backlinks, setBacklinks] = useState<ContentLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType>("related-to");

  useEffect(() => {
    loadLinks();
  }, [content.id]);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const [outgoing, incoming] = await Promise.all([
        getLinksForContent(content.id),
        getBacklinksForContent(content.id),
      ]);
      setLinks(outgoing);
      setBacklinks(incoming);
    } catch (error) {
      console.error("Failed to load links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!selectedTarget) {
      toast.error("Please select a content item");
      return;
    }

    try {
      await createLink(content.id, selectedTarget, selectedLinkType);
      toast.success("Link created");
      setSelectedTarget("");
      setSelectedLinkType("related-to");
      setShowLinkForm(false);
      await loadLinks();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to create link");
      console.error(error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      toast.success("Link deleted");
      await loadLinks();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete link");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading links...</div>;
  }

  const hasLinks = links.length > 0 || backlinks.length > 0;

  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Related Content</h3>
      </div>

      {/* Outgoing Links */}
      {links.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Links from this content:</p>
          {links.map((link) => {
            const targetItem = allContent.find((item) => item.id === link.target_content_id);
            return (
              <div
                key={link.id}
                className="flex items-center justify-between gap-2 p-2 bg-secondary/30 rounded text-xs"
              >
                <div>
                  <p className="font-medium text-foreground">{targetItem?.title || "Unknown"}</p>
                  <p className="text-muted-foreground">{linkTypeLabels[link.link_type]}</p>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  title="Remove link"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Incoming Links */}
      {backlinks.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Links to this content:</p>
          {backlinks.map((link) => {
            const sourceItem = allContent.find((item) => item.id === link.source_content_id);
            return (
              <div
                key={link.id}
                className="flex items-center justify-between gap-2 p-2 bg-secondary/30 rounded text-xs"
              >
                <div>
                  <p className="font-medium text-foreground">{sourceItem?.title || "Unknown"}</p>
                  <p className="text-muted-foreground">{linkTypeLabels[link.link_type]}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Link Button */}
      <div className="mt-3">
        {!showLinkForm ? (
          <Button
            onClick={() => setShowLinkForm(true)}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Link
          </Button>
        ) : (
          <div className="space-y-2 p-3 bg-secondary/20 rounded">
            <div>
              <label className="text-xs font-medium block mb-1">Link Type</label>
              <select
                value={selectedLinkType}
                onChange={(e) => setSelectedLinkType(e.target.value as LinkType)}
                className="w-full h-7 text-xs border rounded px-2 bg-background"
              >
                <option value="related-to">Related to</option>
                <option value="references">References</option>
                <option value="referenced-by">Referenced by</option>
                <option value="generates">Generates</option>
                <option value="depends-on">Depends on</option>
                <option value="solves">Solves</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Select Content</label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full h-7 text-xs border rounded px-2 bg-background"
              >
                <option value="">-- Choose an item --</option>
                {allContent
                  .filter((item) => item.id !== content.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.type})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-1">
              <Button
                onClick={handleAddLink}
                size="sm"
                className="h-7 text-xs flex-1"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowLinkForm(false);
                  setSelectedTarget("");
                }}
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
