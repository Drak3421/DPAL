import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/space/Hero";
import Capabilities from "@/components/space/Capabilities";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <Capabilities />
    </main>
  );
}
