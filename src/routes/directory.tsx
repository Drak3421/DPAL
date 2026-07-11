import { createFileRoute, redirect } from "@tanstack/react-router";

import { AudioToggle } from "../components/AudioPlayer";

// Shared flag set by the landing page when the user clicks "Enter".
export const entered = { value: false };

export const Route = createFileRoute("/directory")({
  beforeLoad: () => {
    // On a hard reload or direct visit, send users back to the landing page.
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
