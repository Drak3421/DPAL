import { createFileRoute } from "@tanstack/react-router";

import { AudioToggle } from "../components/AudioPlayer";

// Shared flag used by the landing page to detect direct navigation
export const entered = { value: false };

export const Route = createFileRoute("/directory")({
  component: Directory,
  head: () => ({
    meta: [
      { title: "DPAL | Directory" },
      { name: "description", content: "DPAL - The ultimate piracy and media discovery app." },
    ],
  }),
});

function Directory() {
  entered.value = true;

  return (
    <main className="fixed inset-0 bg-black">
      <iframe
        src="/dpal/index.html"
        title="DPAL Directory"
        className="dir-reveal fixed inset-0 h-screen w-screen border-0 bg-black"
      />
      <AudioToggle />
    </main>
  );
}
