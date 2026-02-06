import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AutoDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteAtTime: string | null) => void;
  itemTitle: string;
}

const deleteOptions = [
  {
    label: "1 Hour",
    description: "Delete after 1 hour",
    hours: 1,
  },
  {
    label: "1 Day",
    description: "Delete after 1 day",
    hours: 24,
  },
  {
    label: "1 Week",
    description: "Delete after 1 week",
    hours: 168,
  },
  {
    label: "1 Month",
    description: "Delete after 1 month",
    hours: 720,
  },
  {
    label: "Custom",
    description: "Set custom delete time",
    hours: null,
  },
];

export const AutoDeleteModal: React.FC<AutoDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
}) => {
  const [selectedHours, setSelectedHours] = useState<number | null>(24);
  const [customDays, setCustomDays] = useState<string>("1");
  const [showNoDelete, setShowNoDelete] = useState(false);

  const handleConfirm = () => {
    if (showNoDelete) {
      onConfirm(null);
      toast.success("Auto-delete disabled");
    } else {
      const hours =
        selectedHours !== null ? selectedHours : parseInt(customDays) * 24;
      if (isNaN(hours) || hours <= 0) {
        toast.error("Please enter a valid number of days");
        return;
      }

      const deleteAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      const deleteAtTime = deleteAt.toISOString();

      const daysOrHours = hours >= 24 ? `${hours / 24} day(s)` : `${hours} hour(s)`;
      onConfirm(deleteAtTime);
      toast.success(`Item will be deleted in ${daysOrHours}`);
    }
    onClose();
  };

  const handleOptionChange = (hours: number | null) => {
    setSelectedHours(hours);
    setShowNoDelete(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Auto-Delete Completed Item</DialogTitle>
          <DialogDescription>
            Schedule automatic deletion for "{itemTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Delete Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Delete After:</p>
            <div className="grid grid-cols-2 gap-2">
              {deleteOptions.slice(0, 4).map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleOptionChange(option.hours!)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedHours === option.hours && !showNoDelete
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Input */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Custom (Days):</p>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={(e) => {
                  setCustomDays(e.target.value);
                  setSelectedHours(null);
                  setShowNoDelete(false);
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter number of days"
              />
              <span className="px-3 py-2 text-sm text-muted-foreground">days</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
            <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Once deleted, this item cannot be recovered.
            </p>
          </div>

          {/* No Delete Option */}
          <button
            onClick={() => {
              setShowNoDelete(!showNoDelete);
              setSelectedHours(null);
            }}
            className={`w-full p-2 rounded-lg border-2 transition-all text-sm ${
              showNoDelete
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border hover:border-foreground/30 text-foreground"
            }`}
          >
            Don't Auto-Delete
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
