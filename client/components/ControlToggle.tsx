import React from "react";
import { ChevronDown, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlToggleProps {
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  onFilterClick: () => void;
  onNewContentClick: () => void;
  isFilterActive?: boolean;
}

export const ControlToggle: React.FC<ControlToggleProps> = ({
  isExpanded,
  onToggle,
  onFilterClick,
  onNewContentClick,
  isFilterActive = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Three Controls Aligned Horizontally - Buttons appear/disappear */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Left: Filter Button - Only visible when expanded */}
        {isExpanded && (
          <div className="animate-in fade-in duration-200">
            <Button
              onClick={onFilterClick}
              variant={isFilterActive ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        )}

        {/* Center: Chevron Toggle - Always visible and fixed */}
        <button
          onClick={() => onToggle(!isExpanded)}
          className="flex items-center justify-center p-2 rounded-md hover:bg-secondary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className="w-5 h-5 text-muted-foreground transition-transform duration-300 ease-out"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Right: New Content Button - Only visible when expanded */}
        {isExpanded && (
          <div className="animate-in fade-in duration-200">
            <Button
              onClick={onNewContentClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};
