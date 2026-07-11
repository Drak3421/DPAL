import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { categoryStats } from "@/data/directory";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioToggle } from "@/components/AudioPlayer";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "DPAL — Freedom lives in the archive" },
      {
        name: "description",
        content:
          "A curated directory of tools, sites, and communities for streaming, downloading, reading, gaming, and reclaiming the media you love.",
      },
      { property: "og:title", content: "DPAL — Freedom lives in the archive" },
      {
        property: "og:description",
        content: "A curated directory for reclaiming the media you love.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  const cats = categoryStats();
  const totalItems = cats.reduce((n, c) => n + c.itemCount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
          <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            <span>{totalItems.toLocaleString()} curated entries · {cats.length} categories</span>
          </div>
          <h1 className="font-heading text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Freedom lives in <em className="italic text-accent">the archive</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            A hand-tended directory of the tools, sites, and communities that keep culture
            open — streaming, downloading, reading, gaming, learning.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/directory"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Enter the archive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/favorites"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              Your favorites
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl">Browse by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              22 sections, each one a doorway.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.slug}
              to="/category/$category"
              params={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.04]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 transition-opacity group-hover:from-accent/5 group-hover:to-transparent group-hover:opacity-100" />
              <div className="relative flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-xl text-foreground">{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.subcategories.length} sections · {c.itemCount.toLocaleString()} entries
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        DPAL · The archive is yours.
      </footer>

      <AudioToggle />
    </div>
  );
}
