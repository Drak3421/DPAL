import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { categoryStats, searchEntries } from "@/data/directory";
import { EntryCard } from "@/components/EntryCard";
import { CategorySidebar } from "@/components/CategorySidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioToggle } from "@/components/AudioPlayer";
import { Link } from "@tanstack/react-router";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/directory")({
  validateSearch: searchSchema,
  component: DirectoryPage,
  head: () => ({
    meta: [
      { title: "Browse the archive — DPAL" },
      {
        name: "description",
        content: "Search 22,000+ curated links across 22 categories in the DPAL archive.",
      },
      { property: "og:title", content: "Browse the archive — DPAL" },
      { property: "og:url", content: "/directory" },
    ],
    links: [{ rel: "canonical", href: "/directory" }],
  }),
});

function DirectoryPage() {
  const { q: initialQ } = Route.useSearch();
  const [query, setQuery] = useState(initialQ ?? "");
  const cats = categoryStats();

  const results = useMemo(() => (query.trim() ? searchEntries(query, 200) : null), [query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onSearch={setQuery} defaultQuery={initialQ ?? ""} />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-2 md:block">
          <CategorySidebar />
        </aside>

        <main className="min-w-0 flex-1">
          {results ? (
            <div>
              <h1 className="font-heading text-3xl">
                {results.length} result{results.length === 1 ? "" : "s"}
                <span className="ml-2 text-base text-muted-foreground">for "{query}"</span>
              </h1>
              {results.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Nothing matches. Try a broader term.
                </p>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((e, i) => (
                    <div key={i}>
                      <EntryCard item={e.item} />
                      <div className="mt-1 pl-1 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        {e.category} · {e.subcategory}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h1 className="font-heading text-4xl">The Archive</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a category to dive in — or search anything.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cats.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$category"
                    params={{ category: c.slug }}
                    className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <h3 className="font-heading text-lg text-foreground group-hover:text-accent">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.itemCount.toLocaleString()} entries
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <AudioToggle />
    </div>
  );
}
