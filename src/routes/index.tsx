import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AudioToggle } from "../components/AudioPlayer";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "DPAL | Directory" },
      { name: "description", content: "DPAL - The ultimate piracy and media discovery app." },
    ],
  }),
});

function HomePage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <main className="fixed inset-0 bg-black">
      <iframe
        src="/dpal/index.html"
        title="DPAL Directory"
        onLoad={() => setLoaded(true)}
        className="fixed inset-0 h-screen w-screen border-0 bg-black"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 500ms ease-out" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-black"
        style={{ opacity: loaded ? 0 : 1, transition: "opacity 500ms ease-out" }}
      />
      <AudioToggle />
    </main>
  );
}
