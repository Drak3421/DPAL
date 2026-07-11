import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { entered } from "./directory";
import { AudioToggle, getSharedAudio } from "../components/AudioPlayer";

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
  const [exiting, setExiting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Preload the directory iframe in the background as soon as landing mounts
  useEffect(() => {
    const t = setTimeout(() => {
      if (iframeRef.current && !iframeRef.current.src) {
        iframeRef.current.src = "/dpal/index.html";
      }
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // Support browser back button returning to landing
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname === "/") {
        setShowDirectory(false);
        setExiting(false);
        entered.value = false;
      } else if (window.location.pathname === "/directory") {
        entered.value = true;
        setExiting(true);
        setShowDirectory(true);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    const a = getSharedAudio();
    if (a && a.paused) a.play().catch(() => {});
    entered.value = true;
    setExiting(true);
    // Update URL without unmounting — iframe stays alive
    window.history.pushState({}, "", "/directory");
    // After transition completes, mark directory as fully shown (removes hero from DOM)
    setTimeout(() => setShowDirectory(true), 1400);
  };

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
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: exiting ? "scale(1.15)" : "scale(1)",
              transition: "transform 1400ms cubic-bezier(0.4,0,0.2,1)",
            }}
          />

          <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
            <a href="#" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              DPAL
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href="#"
                  className={`text-sm transition-colors hover:text-white ${
                    l.active ? "text-white" : "text-white/60"
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <AudioToggle variant="nav" />
              <button
                onClick={handleEnter}
                className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white transition-transform hover:scale-[1.03]"
              >
                Enter Directory
              </button>
            </div>
          </nav>

          <section className="relative z-10 flex flex-col items-center px-6 pb-40 pt-24 text-center sm:pt-32">
            <h1
              className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] text-white sm:text-7xl md:text-8xl"
              style={{ ...serif, letterSpacing: "-2.46px" }}
            >
              <em className="font-normal not-italic text-white/60" style={playfair}>
                Freedom
              </em>{" "}
              lives{" "}
              <em className="font-normal not-italic text-white/60" style={playfair}>
                in the archive.
              </em>
            </h1>

            <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              A curated directory of tools, sites, and communities for streaming,
              downloading, reading, gaming, and reclaiming the media you love.
            </p>

            <button
              onClick={handleEnter}
              className="animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full bg-[#e8702a] px-14 py-5 text-base font-medium text-white shadow-lg shadow-[#e8702a]/20 transition-all hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-[#e8702a]/40 active:scale-95"
            >
              Enter the Directory
            </button>
          </section>
        </div>
      )}

      {showDirectory && <AudioToggle />}
    </main>
  );
}
