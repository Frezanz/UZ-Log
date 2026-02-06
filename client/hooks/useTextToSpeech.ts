import { useState, useCallback, useRef, useEffect } from "react";

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Helper function to get user-friendly error messages
const getErrorMessage = (errorType: string): string => {
  const errorMap: Record<string, string> = {
    "network-error": "Network error - check your internet connection",
    "synthesis-unavailable": "Speech synthesis is not available",
    "synthesis-in-progress": "Speech is already playing",
    "invalid-argument": "Invalid text or parameters",
    "not-allowed": "Permission denied - check browser permissions",
    "audio-busy": "Audio device is busy",
  };

  return errorMap[errorType] || `Speech synthesis error: ${errorType || "unknown"}`;
};

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const { rate = 1, pitch = 1, volume = 1 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech API is supported
  const isSupported = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      (window.speechSynthesis !== undefined ||
        (window as any).webkitSpeechSynthesis !== undefined)
    );
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported()) {
        console.warn("Text-to-speech is not supported in this browser");
        return;
      }

      // Validate text
      if (!text || text.trim().length === 0) {
        console.warn("Cannot speak: text is empty");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set rate (0.1 to 10, default 1)
      utterance.rate = Math.max(0.1, Math.min(10, rate));

      // Set pitch (0 to 2, default 1) - but some browsers don't support this well
      try {
        utterance.pitch = Math.max(0, Math.min(2, pitch));
      } catch (error) {
        console.warn("Pitch setting not supported by this browser");
      }

      // Set volume (0 to 1, default 1)
      utterance.volume = Math.max(0, Math.min(1, volume));

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsSpeaking(false);
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        try {
          const errorType = event.error || "unknown";
          const errorMessage = getErrorMessage(errorType);

          // Log with clear formatting
          console.error("Speech synthesis error details:", {
            errorType: errorType,
            message: errorMessage,
            timestamp: new Date().toISOString(),
          });

          // Log specific error guidance
          switch (errorType) {
            case "network-error":
              console.warn("Network error - Check your internet connection and try again");
              break;
            case "synthesis-unavailable":
              console.warn("Speech synthesis not available - Try a different browser");
              break;
            case "synthesis-in-progress":
              console.warn("Speech synthesis already in progress - Wait for current speech to finish");
              break;
            case "invalid-argument":
              console.warn("Invalid argument - The text or parameters may be invalid");
              break;
            case "not-allowed":
              console.warn("Not allowed - Check browser permissions");
              break;
            case "audio-busy":
              console.warn("Audio device is busy - Try again shortly");
              break;
            default:
              console.warn(`Unknown error type: ${errorType}`);
          }
        } catch (err) {
          console.error("Error in error handler:", err);
        }

        setIsPlaying(false);
        setIsPaused(false);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error calling speak:", error);
        setIsPlaying(false);
        setIsPaused(false);
        setIsSpeaking(false);
      }
    },
    [isSupported, rate, pitch, volume],
  );

  const pause = useCallback(() => {
    if (!isSupported()) {
      console.warn("Text-to-speech is not supported in this browser");
      return;
    }

    try {
      // Check if there's something actually speaking
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing speech:", error);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported()) {
      console.warn("Text-to-speech is not supported in this browser");
      return;
    }

    try {
      // Check if speech is paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error resuming speech:", error);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported()) {
      console.warn("Text-to-speech is not supported in this browser");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
          setIsPaused(false);
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    };
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSpeaking,
    isSupported: isSupported(),
  };
};
