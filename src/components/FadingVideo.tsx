import { useEffect, useRef, type CSSProperties } from "react";

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export default function FadingVideo({ src, className, style }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeTo = (target: number, duration: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = parseFloat(video.style.opacity || "0") || 0;
      const delta = target - start;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        video.style.opacity = String(start + delta * t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onLoaded = () => {
      video.style.opacity = "0";
      void video.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };
    const onTime = () => {
      if (fadingOutRef.current) return;
      const remaining = video.duration - video.currentTime;
      if (remaining > 0 && remaining <= FADE_OUT_LEAD) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };
    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.style.opacity = "0";
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
