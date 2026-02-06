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

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

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

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsPlaying(false);
        setIsPaused(false);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
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
