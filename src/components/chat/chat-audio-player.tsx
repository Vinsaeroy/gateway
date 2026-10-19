"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/react";

interface ChatAudioPlayerProps {
    src: string;
    fromMe?: boolean;
    fileName?: string;
    onDownload?: () => void;
}

export function ChatAudioPlayer({ src, fromMe = false, fileName, onDownload }: ChatAudioPlayerProps) {
    const { t } = useTranslation();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === Infinity) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        setIsLoading(true);
        setIsError(false);
        setIsPlaying(false);
        setCurrentTime(0);

        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            setIsLoading(false);
        };

        const onTimeUpdate = () => {
            if (!isSeeking) {
                setCurrentTime(audio.currentTime);
            }
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const onError = () => {
            setIsLoading(false);
            setIsError(true);
            setIsPlaying(false);
        };

        const onCanPlay = () => {
            setIsLoading(false);
        };

        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
        audio.addEventListener("canplay", onCanPlay);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
            audio.removeEventListener("canplay", onCanPlay);
        };
    }, [src]);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio || isError) return;

        try {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                await audio.play();
                setIsPlaying(true);
            }
        } catch (e) {
            console.error("Audio playback error:", e);
            setIsError(true);
            setIsPlaying(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const toggleSpeed = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
        audio.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    };

    const handleRestart = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        setCurrentTime(0);
        if (!isPlaying) {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex flex-col gap-1.5 py-1 w-full min-w-[240px] max-w-[280px] sm:max-w-[300px]">
            <audio ref={audioRef} src={src} preload="metadata" playsInline />

            <div className="flex items-center gap-2.5">
                {/* Play/Pause Button */}
                <Button
                    type="button"
                    size="icon"
                    onClick={togglePlay}
                    disabled={isError}
                    className={cn(
                        "h-9 w-9 rounded-full flex-shrink-0 transition-transform active:scale-95 shadow-sm",
                        fromMe
                            ? "bg-white text-primary hover:bg-white/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isError ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                    ) : (
                        <Play className="h-4 w-4 fill-current translate-x-0.5" />
                    )}
                </Button>

                {/* Progress bar and time */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    {/* Scrubbable Seek Bar */}
                    <div className="relative flex items-center h-4 group/seek cursor-pointer">
                        {/* Custom visual track */}
                        <div
                            className={cn(
                                "w-full h-1.5 rounded-full overflow-hidden relative",
                                fromMe ? "bg-white/25" : "bg-muted-foreground/20"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-75",
                                    fromMe ? "bg-white" : "bg-primary"
                                )}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Interactive Range Input */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            onMouseDown={() => setIsSeeking(true)}
                            onMouseUp={() => setIsSeeking(false)}
                            onTouchStart={() => setIsSeeking(true)}
                            onTouchEnd={() => setIsSeeking(false)}
                            disabled={isError || duration === 0}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            aria-label={t("chat.audio.seek")}
                        />
                    </div>

                    {/* Time Indicator */}
                    <div className="flex justify-between items-center text-[10px] select-none font-medium">
                        <span className={cn(fromMe ? "text-white/80" : "text-muted-foreground")}>
                            {formatTime(currentTime)}
                        </span>
                        <span className={cn(fromMe ? "text-white/60" : "text-muted-foreground/80")}>
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Playback speed toggle */}
                <button
                    type="button"
                    onClick={toggleSpeed}
                    className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors select-none flex-shrink-0",
                        fromMe
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                    title={t("chat.audio.changeSpeed")}
                >
                    {playbackRate}x
                </button>

                {/* Download Button */}
                {onDownload && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={onDownload}
                        className={cn(
                            "h-7 w-7 rounded-full flex-shrink-0 opacity-75 hover:opacity-100",
                            fromMe ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-muted"
                        )}
                        title={t("chat.audio.download")}
                    >
                        <Download className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {isError && (
                <p className={cn("text-[10px]", fromMe ? "text-white/90" : "text-destructive")}>
                    {t("chat.audio.loadError")}
                </p>
            )}
        </div>
    );
}
