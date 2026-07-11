import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioToggle } from "@/components/AudioPlayer";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [
      { title: "Your favorites — DPAL" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-heading text-5xl">Favorites</h1>
        <p className="mt-3 text-muted-foreground">
          Coming next: save entries locally with a tap of the heart.
        </p>
        <Link
          to="/directory"
          className="mt-8 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
        >
          Browse the archive
        </Link>
      </div>
      <AudioToggle />
    </div>
  );
}
