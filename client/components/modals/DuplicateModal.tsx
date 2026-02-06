import React, { useState } from "react";
import { ContentItem } from "@/types/content";
import { DuplicatePair } from "@/lib/duplicateDetector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mergeContent } from "@/lib/api";
import { Copy, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicatePair[];
  onMerge?: (primaryId: string, duplicateId: string) => Promise<void>;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  onMerge,
}) => {
  const [selectedPair, setSelectedPair] = useState<DuplicatePair | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [primaryItemId, setPrimaryItemId] = useState<string>("");

  if (!isOpen || duplicates.length === 0) return null;

  const handleMerge = async () => {
    if (!selectedPair || !primaryItemId) return;

    const primaryItem =
      selectedPair.item1.id === primaryItemId
        ? selectedPair.item1
        : selectedPair.item2;
    const duplicateItem =
      selectedPair.item1.id === primaryItemId
        ? selectedPair.item2
        : selectedPair.item1;

    setIsMerging(true);
    try {
      if (onMerge) {
        await onMerge(primaryItem.id, duplicateItem.id);
      } else {
        // Merge content items
        const mergedData = {
          tags: [
            ...new Set([
              ...(primaryItem.tags || []),
              ...(duplicateItem.tags || []),
            ]),
          ],
          category: primaryItem.category || duplicateItem.category,
        };
        await mergeContent(primaryItem.id, duplicateItem.id, mergedData);
      }
      toast.success("Content merged successfully");
      setSelectedPair(null);
      setPrimaryItemId("");
    } catch (error) {
      toast.error("Failed to merge content");
      console.error(error);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Duplicate Content Detected
          </DialogTitle>
          <DialogDescription>
            {duplicates.length} potential duplicate{duplicates.length > 1 ? "s" : ""} found. Review and merge them to clean up your library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedPair ? (
            // Duplicates List
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {duplicates.map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPair(pair);
                    setPrimaryItemId(pair.item1.id);
                  }}
                  className="w-full text-left p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {pair.item1.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {pair.item2.title}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4 text-right">
                      <div className="text-lg font-semibold text-primary">
                        {Math.round(pair.similarity * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">match</p>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {pair.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs bg-secondary/30 px-2 py-1 rounded"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Merge Details
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-secondary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  Choose which version to keep
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the primary item to keep. The other will be merged and deleted.
                </p>

                <div className="space-y-2">
                  {/* Item 1 */}
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors">
                    <input
                      type="radio"
                      name="primaryItem"
                      value={selectedPair.item1.id}
                      checked={primaryItemId === selectedPair.item1.id}
                      onChange={(e) => setPrimaryItemId(e.target.value)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {selectedPair.item1.title}
                      </p>
                      {selectedPair.item1.content && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {selectedPair.item1.content.substring(0, 100)}...
                        </p>
                      )}
                      {selectedPair.item1.tags && selectedPair.item1.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {selectedPair.item1.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                          {selectedPair.item1.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{selectedPair.item1.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(selectedPair.item1.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </label>

                  {/* Item 2 */}
                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors">
                    <input
                      type="radio"
                      name="primaryItem"
                      value={selectedPair.item2.id}
                      checked={primaryItemId === selectedPair.item2.id}
                      onChange={(e) => setPrimaryItemId(e.target.value)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {selectedPair.item2.title}
                      </p>
                      {selectedPair.item2.content && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {selectedPair.item2.content.substring(0, 100)}...
                        </p>
                      )}
                      {selectedPair.item2.tags && selectedPair.item2.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {selectedPair.item2.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                          {selectedPair.item2.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{selectedPair.item2.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(selectedPair.item2.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="p-4 border border-border rounded-lg bg-secondary/10">
                <p className="text-sm font-medium text-foreground mb-2">Why they're similar:</p>
                <div className="flex flex-col gap-1">
                  {selectedPair.reasons.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3 h-3 text-green-600" />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border flex-wrap">
          {selectedPair && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPair(null);
                setPrimaryItemId("");
              }}
            >
              Back
            </Button>
          )}
          {selectedPair && (
            <Button
              onClick={handleMerge}
              disabled={isMerging || !primaryItemId}
            >
              {isMerging ? "Merging..." : "Merge Content"}
            </Button>
          )}
          {!selectedPair && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
