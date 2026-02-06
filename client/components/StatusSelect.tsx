import React, { useState, useRef, useEffect } from "react";
import { ContentStatus } from "@/types/content";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Clock, CheckCircle2, EyeOff } from "lucide-react";

interface StatusSelectProps {
  value?: ContentStatus;
  onChange: (status: ContentStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  },
  completed: {
    label: "Completed",
    icon: Check,
    color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  },
  hidden: {
    label: "Hidden",
    icon: EyeOff,
    color: "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300",
  },
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value = "active",
  onChange,
  disabled = false,
}) => {
  const safeValue = (value || "active") as ContentStatus;
  const currentStatus = statusConfig[safeValue];
  const Icon = currentStatus?.icon || CheckCircle2;

  return (
    <Select
      value={safeValue}
      onValueChange={(v) => onChange(v as ContentStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <StatusIcon className="w-3.5 h-3.5" />
                {config.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export const StatusBadge: React.FC<{ status?: ContentStatus }> = ({
  status = "active",
}) => {
  // Default to "active" if status is undefined
  const safeStatus = (status || "active") as ContentStatus;
  const config = statusConfig[safeStatus];

  // Fallback in case config is still undefined
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300">
        Unknown
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${config.color}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
};

interface StatusDropdownProps {
  status?: ContentStatus;
  onChange: (status: ContentStatus) => void;
  disabled?: boolean;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  status = "active",
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const safeStatus = (status || "active") as ContentStatus;
  const config = statusConfig[safeStatus];
  const Icon = config?.icon || CheckCircle2;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleStatusSelect = (newStatus: ContentStatus) => {
    if (newStatus !== safeStatus) {
      setIsChanging(true);
      onChange(newStatus);
      setTimeout(() => setIsChanging(false), 300);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          !disabled && setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium transition-all h-6 ${
          config?.color ||
          "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"} ${
          isChanging ? "scale-95" : "scale-100"
        }`}
        title="Click to change status"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Icon className="w-2.5 h-2.5" />
        <span>{config?.label || "Unknown"}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="absolute top-full mt-1 left-0 z-50 bg-popover border border-border shadow-lg py-1 min-w-[140px]"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const StatusIcon = cfg.icon;
            const isSelected = key === safeStatus;
            return (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusSelect(key as ContentStatus);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="flex-1">{cfg.label}</span>
                {isSelected && <Check className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
