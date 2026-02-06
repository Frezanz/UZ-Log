import { useState, useCallback, useRef, useEffect } from "react";

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

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
        const errorDetails = {
          error: event.error,
          message: `Speech synthesis error: ${event.error}`,
        };
        console.error("Speech synthesis error:", errorDetails);

        // Log more details for debugging
        if (event.error === "network-error") {
          console.warn("Network error - check internet connection");
        } else if (event.error === "synthesis-unavailable") {
          console.warn("Speech synthesis not available");
        } else if (event.error === "synthesis-in-progress") {
          console.warn("Speech synthesis already in progress");
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
    if (isSupported() && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isSupported, isPlaying]);

  const resume = useCallback(() => {
    if (isSupported() && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported()) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported()) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

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
