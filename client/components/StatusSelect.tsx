import React from "react";
import { ContentStatus } from "@/types/content";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Clock, CheckCircle2 } from "lucide-react";

interface StatusSelectProps {
  value: ContentStatus;
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
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const currentStatus = statusConfig[value];
  const Icon = currentStatus.icon;

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ContentStatus)} disabled={disabled}>
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

export const StatusBadge: React.FC<{ status?: ContentStatus }> = ({ status = "active" }) => {
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
