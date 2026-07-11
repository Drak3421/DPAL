import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AudioToggle, getSharedAudio } from "../components/AudioPlayer";
import { entered } from "./directory";


export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "DPAL — Freedom lives in the archive" },
      {
        name: "description",
        content:
          "A curated directory of tools, sites, and communities for streaming, downloading, reading, gaming, and reclaiming the media you love.",
      },
    ],
  }),
});

const navLinks = [
  { label: "Home", active: true },
  { label: "Directory" },
  { label: "About" },
  { label: "Journal" },
  { label: "Reach Us" },
];

const serif = { fontFamily: "'Instrument Serif', serif" };
const playfair = { fontFamily: "'Playfair Display', serif" };

function HomePage() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [speed, setSpeed] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const speedRef = useRef(1);
  const triggeredRef = useRef(false);

  // Preload the directory iframe in the background as soon as landing mounts
  useEffect(() => {
    const t = setTimeout(() => {
      if (iframeRef.current && !iframeRef.current.src) {
        iframeRef.current.src = "/dpal/index.html";
      }
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    entered.value = true;

    const a = getSharedAudio();
    if (a && a.paused) a.play().catch(() => {});
    if (iframeRef.current && !iframeRef.current.src) {
      iframeRef.current.src = "/dpal/index.html";
    }
    setExiting(true);
    setTimeout(() => setShowDirectory(true), 450);
    setTimeout(() => navigate({ to: "/directory" }), 1400);
  };

  // Scroll → speed up video. When speed passes threshold, enter the directory.
  useEffect(() => {
    const MAX_SPEED = 6;
    const TRIGGER = 5.5;
    const DECAY_PER_SEC = 0.6;

    const bump = (deltaY: number) => {
      if (triggeredRef.current) return;
      const next = Math.min(MAX_SPEED, Math.max(1, speedRef.current + deltaY * 0.004));
      speedRef.current = next;
      setSpeed(next);
      if (videoRef.current) videoRef.current.playbackRate = next;
      if (next >= TRIGGER) {
        triggeredRef.current = true;
        handleEnter();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (exiting) return;
      e.preventDefault();
      bump(e.deltaY);
    };

    let lastTouch = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouch = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (exiting) return;
      const y = e.touches[0].clientY;
      const dy = lastTouch - y;
      lastTouch = y;
      bump(dy * 2);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Gentle decay so the effect eases back when the user stops scrolling.
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!triggeredRef.current && speedRef.current > 1) {
        const next = Math.max(1, speedRef.current - DECAY_PER_SEC * dt);
        speedRef.current = next;
        setSpeed(next);
        if (videoRef.current) videoRef.current.playbackRate = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, [exiting]);

  const speedProgress = Math.min(1, (speed - 1) / (5.5 - 1));



  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Preloaded directory iframe — persistent, never unmounts */}
      <iframe
        ref={iframeRef}
        title="DPAL"
        aria-hidden={!exiting}
        onLoad={() => setIframeReady(true)}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: 0,
          zIndex: showDirectory ? 50 : 0,
          opacity: exiting && iframeReady ? 1 : 0,
          transform: exiting ? "scale(1)" : "scale(1.04)",
          filter: exiting ? "blur(0)" : "blur(6px)",
          transition:
            "opacity 900ms cubic-bezier(0.4,0,0.2,1) 300ms, transform 1400ms cubic-bezier(0.2,0.8,0.2,1), filter 1000ms ease-out",
          pointerEvents: showDirectory ? "auto" : "none",
        }}
      />

      {/* Hero layer — fades and lifts away to reveal the loaded iframe */}
      {!showDirectory && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            opacity: exiting ? 0 : 1,
            transform: exiting ? "translateY(-16px) scale(0.985)" : "translateY(0) scale(1)",
            filter: exiting ? "blur(10px)" : "blur(0)",
            transition:
              "opacity 800ms cubic-bezier(0.4,0,0.2,1), transform 1200ms cubic-bezier(0.4,0,0.2,1), filter 800ms cubic-bezier(0.4,0,0.2,1)",
            pointerEvents: exiting ? "none" : "auto",
          }}
        >
          <video
            ref={videoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_031045_0e1165dd-ab48-46e3-ad3d-5fe77f217647.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: exiting ? "scale(1.15)" : `scale(${1 + speedProgress * 0.08})`,
              filter: `blur(${speedProgress * 3}px)`,
              transition: exiting
                ? "transform 1400ms cubic-bezier(0.4,0,0.2,1)"
                : "transform 200ms ease-out, filter 200ms ease-out",
            }}
          />


          <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-end px-6 py-6 sm:px-8">
            <AudioToggle variant="nav" />
          </nav>

          <section className="relative z-10 flex min-h-[calc(100vh-96px)] flex-col items-center justify-center px-6 text-center">
            <h1
              className="animate-fade-rise text-white"
              style={{
                ...serif,
                letterSpacing: "-0.06em",
                fontSize: "clamp(6rem, 22vw, 16rem)",
                lineHeight: 0.9,
              }}
            >
              DPAL
            </h1>

            <div className="mt-16 flex flex-col items-center gap-3 text-white/60">
              <span className="text-xs uppercase tracking-[0.3em]">Scroll to accelerate</span>
              <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white/80"
                  style={{
                    width: `${speedProgress * 100}%`,
                    transition: "width 120ms ease-out",
                  }}
                />
              </div>
            </div>
          </section>

        </div>
      )}

      {showDirectory && <AudioToggle />}
    </main>
  );
}
