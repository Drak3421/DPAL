import { useEffect, useRef, useState } from "react";
import songAsset from "../assets/deep-breath.mp3.asset.json";

let sharedAudio: HTMLAudioElement | null = null;

export function getSharedAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(songAsset.url);
    sharedAudio.loop = true;
    sharedAudio.volume = 0.5;
  }
  return sharedAudio;
}

type AudioToggleProps = {
  variant?: "floating" | "nav";
};

export function AudioToggle({ variant = "floating" }: AudioToggleProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = getSharedAudio();
    if (!a) return;
    audioRef.current = a;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    setPlaying(!a.paused);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const isFloating = variant === "floating";
  const buttonClassName = isFloating
    ? "fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 z-[90] grid h-11 w-11 place-items-center rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 active:scale-95 shadow-lg sm:flex sm:w-auto sm:px-3 sm:gap-2"
    : "relative z-[101] flex h-10 items-center gap-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 px-3 text-white transition-all hover:scale-105 active:scale-95 shadow-lg";

  return (
    <>
      <style>{`
        @keyframes eqBar { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        .eq-bar { transform-origin: bottom; animation: eqBar 0.9s ease-in-out infinite; }
      `}</style>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "Pause music" : "Play music"}
        className={buttonClassName}
      >
        {playing ? (
          <span className="flex items-end gap-[3px] h-4">
            <span className="eq-bar block w-[3px] h-full bg-white rounded-sm" style={{ animationDelay: "0s" }} />
            <span className="eq-bar block w-[3px] h-full bg-white rounded-sm" style={{ animationDelay: "0.15s" }} />
            <span className="eq-bar block w-[3px] h-full bg-white rounded-sm" style={{ animationDelay: "0.3s" }} />
            <span className="eq-bar block w-[3px] h-full bg-white rounded-sm" style={{ animationDelay: "0.45s" }} />
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>
        )}
        <span className={isFloating ? "hidden text-[11px] font-medium tracking-wide uppercase sm:inline" : "text-[11px] font-medium tracking-wide uppercase"}>{playing ? "Playing" : "Music"}</span>
      </button>
    </>
  );
}
