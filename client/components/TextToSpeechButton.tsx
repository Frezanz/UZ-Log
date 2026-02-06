import React from "react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Volume2, Pause, Play, X } from "lucide-react";
import { toast } from "sonner";

interface TextToSpeechButtonProps {
  text: string;
  contentType?: "text" | "code" | "prompt" | "script";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  contentType = "text",
  variant = "outline",
  size = "sm",
  showLabel = true,
  className = "",
}) => {
  const { speak, pause, resume, stop, isPlaying, isPaused, isSupported } =
    useTextToSpeech({
      rate: 1,
      pitch: 1,
      volume: 1,
    });

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    try {
      // Check browser support first
      if (!isSupported) {
        toast.error("Text-to-speech is not supported in your browser");
        return;
      }

      if (!text || text.trim() === "") {
        toast.error("No content to read");
        return;
      }

      // Warn if text is very long (may cause issues on some browsers)
      if (text.length > 5000) {
        console.warn(
          `Text is very long (${text.length} chars). Speech synthesis may not work properly.`,
        );
      }

      if (isPlaying || isPaused) {
        if (isPaused) {
          console.log("Resuming paused speech...");
          resume();
          toast.success("Resuming playback...");
        } else {
          console.log("Pausing active speech...");
          pause();
          toast.info("Playback paused");
        }
      } else {
        console.log("Starting new speech with text length:", text.length);
        speak(text);
        // Give user immediate feedback
        setTimeout(() => {
          if (!isPlaying) {
            console.warn(
              "Speech did not start - this may be a browser limitation",
            );
          }
        }, 500);
      }
    } catch (error) {
      console.error("Text-to-speech error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to play audio";
      toast.error(errorMsg);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      stop();
      toast.info("Playback stopped");
    } catch (error) {
      console.error("Error stopping playback:", error);
    }
  };

  return (
    <div className="flex gap-1 items-center">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        title={
          isPlaying
            ? "Pause reading"
            : isPaused
              ? "Resume reading"
              : "Read aloud"
        }
        className={className}
      >
        {isPlaying || isPaused ? (
          isPaused ? (
            <>
              <Play className="w-3 h-3" />
              {showLabel && (
                <span className="ml-1 text-xs hidden sm:inline">Resume</span>
              )}
            </>
          ) : (
            <>
              <Pause className="w-3 h-3" />
              {showLabel && (
                <span className="ml-1 text-xs hidden sm:inline">Pause</span>
              )}
            </>
          )
        ) : (
          <>
            <Volume2 className="w-3 h-3" />
            {showLabel && (
              <span className="ml-1 text-xs hidden sm:inline">Read</span>
            )}
          </>
        )}
      </Button>

      {(isPlaying || isPaused) && (
        <Button
          variant={variant}
          size={size}
          onClick={handleStop}
          title="Stop reading"
          className={className}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};
