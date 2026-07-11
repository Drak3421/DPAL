import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const navLinks = [
  { label: "Home", active: true },
  { label: "Studio" },
  { label: "About" },
  { label: "Journal" },
  { label: "Reach Us" },
];

const serif = { fontFamily: "'Instrument Serif', serif" };

function HomePage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{ background: "hsl(201 100% 13%)", fontFamily: "'Inter', sans-serif" }}
    >
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <a
          href="#"
          className="text-3xl tracking-tight text-white"
          style={serif}
        >
          Velorah<sup className="text-xs">®</sup>
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

        <a
          href="#"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white transition-transform hover:scale-[1.03]"
        >
          Begin Journey
        </a>
      </nav>

      <section className="relative z-10 flex flex-col items-center px-6 pb-40 pt-32 py-[90px] text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] text-white sm:text-7xl md:text-8xl"
          style={{ ...serif, letterSpacing: "-2.46px" }}
        >
          Where <em className="not-italic text-white/60">dreams</em> rise{" "}
          <em className="not-italic text-white/60">through the silence.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          We're designing tools for deep thinkers, bold creators, and quiet rebels.
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <a
          href="#"
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-white transition-transform hover:scale-[1.03]"
        >
          Begin Journey
        </a>
      </section>
    </main>
  );
}
