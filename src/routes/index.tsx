import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <main className="fixed inset-0 bg-black">
      <iframe
        src="/dpal/index.html"
        title="DPAL Directory"
        className="fixed inset-0 h-screen w-screen border-0 bg-black"
      />
      <AudioToggle />
    </main>
  );
}
