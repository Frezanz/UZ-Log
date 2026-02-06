import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, duration: number) => void;
  onAudioRemove?: () => void;
  recordedAudioUrl?: string;
  recordedDuration?: number;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onAudioRemove,
  recordedAudioUrl,
  recordedDuration,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context and media recorder on mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          const audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
          audioContextRef.current = audioContext;

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            chunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const duration = recordingTime;
            onAudioRecorded(blob, duration);
            chunksRef.current = [];
            setRecordingTime(0);
          };
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          console.log("Microphone permission denied");
        } else {
          console.error("Failed to initialize audio:", error);
        }
      }
    };

    initializeAudio();

    return () => {
      // Stop recording if still active
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        } catch (error) {
          console.error("Error stopping media recorder:", error);
        }
      }
      // Close audio context if it exists
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
          }
        } catch (error) {
          console.error("Error closing audio context:", error);
        }
      }
    };
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      if (mediaRecorderRef.current) {
        chunksRef.current = [];
        setRecordingTime(0);
        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const handleStopRecording = () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to stop recording");
    }
  };

  const handlePlayRecording = () => {
    if (recordedAudioUrl && audioPlayRef.current) {
      if (isPlaying) {
        audioPlayRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRemoveRecording = () => {
    if (audioPlayRef.current) {
      audioPlayRef.current.pause();
      audioPlayRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setRecordingTime(0);
    onAudioRemove?.();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const isSupported =
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  if (!isSupported) {
    return (
      <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800  text-xs text-amber-700 dark:text-amber-300">
        Audio recording is not supported in your browser. Please use Chrome,
        Firefox, or Safari.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      {!recordedAudioUrl ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-600 dark:bg-red-400 -full animate-pulse" />
                <span className="text-xs font-medium">Recording...</span>
              </div>
            )}
            {isRecording && (
              <span className="text-xs text-muted-foreground ml-auto">
                {formatTime(recordingTime)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                variant="outline"
                className="flex-1 gap-2"
                size="sm"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                className="flex-1 gap-2"
                size="sm"
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 p-3 bg-secondary/50  border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 -full bg-primary/10 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Voice Recording</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(recordedDuration || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePlayRecording}
              variant="ghost"
              size="sm"
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              onClick={handleRemoveRecording}
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>

          {/* Hidden audio element for playback */}
          <audio
            ref={audioPlayRef}
            src={recordedAudioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
