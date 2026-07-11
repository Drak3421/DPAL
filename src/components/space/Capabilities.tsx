import { motion } from "framer-motion";
import FadingVideo from "../FadingVideo";
import { ImageMaterial, MovieMaterial, BulbMaterial } from "./icons";
import type { ComponentType, SVGProps } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

type Card = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  tags: string[];
  title: string;
  body: string;
};

const cards: Card[] = [
  {
    Icon: ImageMaterial,
    tags: ["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"],
    title: "AI Scenery",
    body: "AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.",
  },
  {
    Icon: MovieMaterial,
    tags: ["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"],
    title: "Batch Production",
    body: "Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.",
  },
  {
    Icon: BulbMaterial,
    tags: ["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"],
    title: "Smart Lighting",
    body: "Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.",
  },
];

export default function Capabilities() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="mb-auto"
        >
          <div className="mb-6 text-sm font-body text-white/80">// Capabilities</div>
          <h2
            className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9]"
            style={{ letterSpacing: "-3px" }}
          >
            Production
            <br />
            evolved
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map(({ Icon, tags, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
              whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.1 + i * 0.15 }}
              className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass flex h-11 w-11 items-center justify-center rounded-[0.75rem]">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 text-[11px] text-white/90 font-body"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              <div className="mt-6">
                <h3
                  className="font-heading italic text-white text-3xl md:text-4xl leading-none"
                  style={{ letterSpacing: "-1px" }}
                >
                  {title}
                </h3>
                <p className="mt-3 max-w-[32ch] text-sm text-white/90 font-body font-light leading-snug">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
