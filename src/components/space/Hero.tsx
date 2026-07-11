import { motion } from "framer-motion";
import FadingVideo from "../FadingVideo";
import BlurText from "../BlurText";
import { ArrowUpRight, Play, ClockIcon, GlobeIcon } from "./icons";

const easeOut = [0.16, 1, 0.3, 1] as const;
const baseInitial = { filter: "blur(10px)", opacity: 0, y: 20 };
const baseAnimate = { filter: "blur(0px)", opacity: 1, y: 0 };

const navLinks = ["Home", "Voyages", "Worlds", "Innovation", "Plan Launch"];

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: "120%", height: "120%" }}
      />

      {/* Navbar */}
      <motion.nav
        initial={baseInitial}
        animate={baseAnimate}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
        className="fixed left-0 right-0 top-4 z-50 flex items-center justify-between px-8 lg:px-16"
      >
        <div className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full">
          <span className="font-heading italic text-white text-2xl leading-none">a</span>
        </div>

        <div className="liquid-glass hidden items-center gap-1 rounded-full px-1.5 py-1.5 md:flex">
          {navLinks.map((l) => (
            <a
              key={l}
              href="#"
              className="rounded-full px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white"
            >
              {l}
            </a>
          ))}
          <a
            href="#"
            className="ml-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Claim a Spot
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="h-12 w-12" aria-hidden />
      </motion.nav>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <motion.div
            initial={baseInitial}
            animate={baseAnimate}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.4 }}
            className="liquid-glass inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3"
          >
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
              New
            </span>
            <span className="text-sm text-white/90 font-body">
              Maiden Crewed Voyage to Mars Arrives 2026
            </span>
          </motion.div>

          <div className="mt-6 max-w-2xl">
            <BlurText
              text="Venture Past Our Sky Across the Universe"
              className="font-heading italic text-white text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.8]"
              style={{ letterSpacing: "-4px" }}
            />
          </div>

          <motion.p
            initial={baseInitial}
            animate={baseAnimate}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.8 }}
            className="mt-4 max-w-2xl text-sm md:text-base text-white font-body font-light leading-tight"
          >
            Discover the universe in ways once unimaginable. Our pioneering vessels and
            breakthrough engineering bring deep-space exploration within reach—secure and
            extraordinary.
          </motion.p>

          <motion.div
            initial={baseInitial}
            animate={baseAnimate}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
            className="mt-6 flex items-center gap-6"
          >
            <a
              href="#"
              className="liquid-glass-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
            >
              Start Your Voyage
              <ArrowUpRight className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-white font-body"
            >
              View Liftoff
              <Play className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={baseInitial}
            animate={baseAnimate}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.3 }}
            className="mt-8 flex items-stretch gap-4"
          >
            {[
              {
                Icon: ClockIcon,
                value: "34.5 Min",
                label: "Average Videos Watch Time",
              },
              {
                Icon: GlobeIcon,
                value: "2.8B+",
                label: "Users Across the Globe",
              },
            ].map(({ Icon, value, label }) => (
              <div
                key={value}
                className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left"
              >
                <Icon className="h-7 w-7 text-white" />
                <div
                  className="mt-6 font-heading italic text-white text-4xl leading-none"
                  style={{ letterSpacing: "-1px" }}
                >
                  {value}
                </div>
                <div className="mt-2 text-xs text-white font-body font-light">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={baseInitial}
          animate={baseAnimate}
          transition={{ duration: 0.8, ease: easeOut, delay: 1.4 }}
          className="flex flex-col items-center gap-4 pb-8"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            Collaborating with top aerospace pioneers globally
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {["Aeon", "Vela", "Apex", "Orbit", "Zeno"].map((p) => (
              <span
                key={p}
                className="font-heading italic text-white text-2xl md:text-3xl tracking-tight"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
