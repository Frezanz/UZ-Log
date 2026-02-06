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
  const suppressErrorRef = useRef<boolean>(false); // Flag to suppress expected errors

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
          // Safely extract error type - handle both string and potential object scenarios
          let errorType = "unknown";

          if (event && typeof event === "object") {
            // Try to get error property
            const errorProp = (event as any).error;
            if (typeof errorProp === "string") {
              errorType = errorProp;
            } else if (errorProp) {
              errorType = String(errorProp);
            }
          }

          // Sanitize error type - remove any [object] strings
          errorType = errorType
            .replace(/\[object\s+.*?\]/gi, "unknown")
            .trim() || "unknown";

          // Only log if not a suppressed error
          if (!suppressErrorRef.current) {
            const errorMessage = getErrorMessage(errorType);

            // Log with explicit string conversion
            console.error("=== Speech Synthesis Error ===");
            console.error(`Error Type: ${errorType}`);
            console.error(`Error Message: ${errorMessage}`);
            console.error(`Timestamp: ${new Date().toISOString()}`);
            console.error("===============================");

            // Log specific error guidance only for real errors
            switch (errorType) {
              case "network-error":
                console.warn("Network Error: Check your internet connection and try again");
                break;
              case "synthesis-unavailable":
                console.warn("Unavailable: Speech synthesis is not available - Try a different browser");
                break;
              case "synthesis-in-progress":
                console.debug("In Progress: Waiting for current speech to finish");
                break;
              case "invalid-argument":
                console.warn("Invalid Argument: The text or parameters may be invalid");
                break;
              case "not-allowed":
                console.warn("Permission Denied: Check browser permissions for speech synthesis");
                break;
              case "audio-busy":
                console.warn("Audio Busy: Audio device is busy - Try again shortly");
                break;
              default:
                if (errorType !== "unknown") {
                  console.warn(`Error: ${errorType}`);
                }
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("Error in error handler itself:", errMsg);
        }

        setIsPlaying(false);
        setIsPaused(false);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;

      try {
        // Check speech synthesis state before speaking
        const pendingUtterances = window.speechSynthesis.pending;
        const isSpeaking = window.speechSynthesis.speaking;
        const isPaused = window.speechSynthesis.paused;

        if (isSpeaking && !isPaused) {
          console.info("Speech synthesis already speaking, canceling previous speech");
          window.speechSynthesis.cancel();
        }

        console.info("Starting speech synthesis with:", {
          textLength: text.length,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume,
          pendingUtterances: pendingUtterances,
        });

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Error calling speak:", errorMsg);
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
      const synth = window.speechSynthesis;

      // Check if there's something actually speaking and not paused
      if (synth.speaking && !synth.paused) {
        console.log("Pausing speech synthesis");
        synth.pause();
        setIsPaused(true);
        setIsPlaying(false);
      } else {
        console.warn("No active speech to pause - speaking:", synth.speaking, "paused:", synth.paused);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error pausing speech:", errorMsg);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported()) {
      console.warn("Text-to-speech is not supported in this browser");
      return;
    }

    try {
      const synth = window.speechSynthesis;

      // Check if speech is paused
      if (synth.paused && synth.speaking) {
        console.log("Resuming paused speech synthesis");
        synth.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        console.warn("No paused speech to resume - speaking:", synth.speaking, "paused:", synth.paused);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error resuming speech:", errorMsg);
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
