import { useEffect, useRef, useState } from "react";

const SONG_URL = "/audio/deep-breath.mp3";

let sharedAudio: HTMLAudioElement | null = null;

// Lazy: only construct the Audio element when actually needed (not at
// module load). The mp3 is ~2.6 MB, so `preload="none"` avoids fetching
// it until the user (or an autoplay attempt in the effect) requests play.
if (typeof window !== "undefined") {
  getSharedAudio();
}

export function getSharedAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(SONG_URL);
    sharedAudio.loop = true;
    sharedAudio.volume = 0.5;
    sharedAudio.preload = "auto";
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

    // Try autoplay on load; if blocked, start on first user interaction.
    if (a.paused) {
      a.play().catch(() => {
        const start = () => {
          a.play().catch(() => {});
          
          // Remove from parent
          window.removeEventListener("pointerdown", start);
          window.removeEventListener("mousedown", start);
          window.removeEventListener("click", start);
          window.removeEventListener("keydown", start);
          window.removeEventListener("touchstart", start);

          // Remove from all iframes
          document.querySelectorAll("iframe").forEach((iframe) => {
            try {
              const doc = iframe.contentDocument || iframe.contentWindow?.document;
              if (doc) {
                doc.removeEventListener("pointerdown", start);
                doc.removeEventListener("mousedown", start);
                doc.removeEventListener("click", start);
                doc.removeEventListener("keydown", start);
                doc.removeEventListener("touchstart", start);
              }
            } catch (err) {}
          });
        };

        // Add to parent
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("mousedown", start, { once: true });
        window.addEventListener("click", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
        window.addEventListener("touchstart", start, { once: true });

        // Add to all current iframes and listen for their loads
        const attachToIframes = () => {
          document.querySelectorAll("iframe").forEach((iframe) => {
            try {
              const doc = iframe.contentDocument || iframe.contentWindow?.document;
              if (doc) {
                doc.addEventListener("pointerdown", start, { once: true });
                doc.addEventListener("mousedown", start, { once: true });
                doc.addEventListener("click", start, { once: true });
                doc.addEventListener("keydown", start, { once: true });
                doc.addEventListener("touchstart", start, { once: true });
              }
            } catch (err) {}
          });
        };

        attachToIframes();
        const loadTargets: HTMLIFrameElement[] = [];
        document.querySelectorAll("iframe").forEach((iframe) => {
          iframe.addEventListener("load", attachToIframes);
          loadTargets.push(iframe as HTMLIFrameElement);
        });
        // Ensure the "load" listeners are removed once autoplay succeeds,
        // otherwise every iframe reload re-attaches listeners forever.
        const cleanupLoadListeners = () => {
          loadTargets.forEach((iframe) => iframe.removeEventListener("load", attachToIframes));
        };
        window.addEventListener("pointerdown", cleanupLoadListeners, { once: true });
        window.addEventListener("keydown", cleanupLoadListeners, { once: true });
        window.addEventListener("touchstart", cleanupLoadListeners, { once: true });
      });
    }

    // Pause when tab is hidden, when another <audio>/<video> on the page starts playing,
    // or when the embedded DPAL browser reports that a nested website/video took focus.
    const onVisibility = () => { if (document.hidden && !a.paused) a.pause(); };
    const onOtherPlay = (e: Event) => {
      const target = e.target as HTMLMediaElement | null;
      if (target && target !== a && target instanceof HTMLMediaElement && !a.paused) a.pause();
    };
    const onEmbeddedBrowserAudio = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string } | null;
      if (data?.type === "DPAL_PAUSE_BACKGROUND_AUDIO" && !a.paused) a.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("play", onOtherPlay, true);
    window.addEventListener("message", onEmbeddedBrowserAudio);

    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("play", onOtherPlay, true);
      window.removeEventListener("message", onEmbeddedBrowserAudio);
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
