import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { AudioToggle } from "../components/AudioPlayer";

// Shared flag set by the landing page when the user clicks "Enter".
export const entered = { value: false };

export const Route = createFileRoute("/directory")({
  beforeLoad: () => {
    if (!entered.value) {
      throw redirect({ to: "/" });
    }
  },

  component: Directory,
  head: () => ({
    meta: [
      { title: "DPAL | Directory" },
      { name: "description", content: "DPAL - The ultimate piracy and media discovery app." },
    ],
  }),
});

function Directory() {
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="fixed inset-0 bg-black">
      <iframe
        src="/dpal/index.html"
        title="DPAL Directory"
        onLoad={() => setLoaded(true)}
        className="fixed inset-0 h-screen w-screen border-0 bg-black"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 500ms ease-out",
        }}
      />
      {/* Black cover stays until iframe reports loaded */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-black"
        style={{
          opacity: loaded ? 0 : 1,
          transition: "opacity 500ms ease-out",
        }}
      />
      <AudioToggle />
    </main>
  );
}
