import React, { useState } from "react";
import { SyntaxAnalysisResult, getSyntaxSummary } from "@/lib/syntaxChecker";
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyntaxErrorDisplayProps {
  result: SyntaxAnalysisResult;
  compact?: boolean;
  className?: string;
}

export const SyntaxErrorDisplay: React.FC<SyntaxErrorDisplayProps> = ({
  result,
  compact = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(!compact);

  if (result.totalLines === 0) {
    return null;
  }

  const summary = getSyntaxSummary(result);
  const errorCount = result.errors.filter((e) => e.type === "error").length;
  const warningCount = result.errors.filter((e) => e.type === "warning").length;
  const hasErrors = result.hasErrors;

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        hasErrors
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
        className
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
          hasErrors
            ? "text-red-900 dark:text-red-200"
            : "text-green-900 dark:text-green-200"
        )}
      >
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{summary}</span>
        </div>
        {hasErrors && (
          expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        )}
      </button>

      {expanded && hasErrors && result.errors.length > 0 && (
        <div className="border-t border-inherit">
          <div className="max-h-96 overflow-y-auto">
            {result.errors.map((error, idx) => (
              <div
                key={idx}
                className={cn(
                  "px-4 py-3 text-sm border-t border-inherit first:border-t-0",
                  error.type === "error"
                    ? "bg-red-100/50 dark:bg-red-900/30 text-red-900 dark:text-red-200"
                    : "bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold",
                        error.type === "error"
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                      )}
                    >
                      L{error.line}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{error.message}</p>
                    {error.code && (
                      <p className="text-xs opacity-75 mt-1">
                        Code: {error.code}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-1 rounded",
                        error.type === "error"
                          ? "bg-red-200 dark:bg-red-800"
                          : "bg-yellow-200 dark:bg-yellow-800"
                      )}
                    >
                      {error.type.charAt(0).toUpperCase() +
                        error.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-black/5 dark:bg-white/5 border-t border-inherit text-xs text-muted-foreground">
            <div className="flex gap-4">
              <div>
                <span className="font-medium">Total Lines:</span>{" "}
                {result.totalLines}
              </div>
              <div>
                <span className="font-medium">Affected Lines:</span>{" "}
                {result.affectedLines}
              </div>
              {result.language && result.language !== "unknown" && (
                <div>
                  <span className="font-medium">Detected Language:</span>{" "}
                  {result.language.charAt(0).toUpperCase() +
                    result.language.slice(1)}
                </div>
              )}
              {errorCount > 0 && (
                <div>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Errors: {errorCount}
                  </span>
                </div>
              )}
              {warningCount > 0 && (
                <div>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    Warnings: {warningCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
