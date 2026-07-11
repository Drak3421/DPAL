import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findCategory } from "@/data/directory";
import { EntryCard } from "@/components/EntryCard";
import { CategorySidebar } from "@/components/CategorySidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { AudioToggle } from "@/components/AudioPlayer";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/category/$category")({
  loader: ({ params }) => {
    const cat = findCategory(params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-heading text-4xl">Category not found</h1>
        <Link to="/directory" className="mt-6 inline-block text-accent hover:underline">
          Back to the archive →
        </Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — DPAL" }, { name: "robots", content: "noindex" }] };
    }
    const name = loaderData.category.name;
    return {
      meta: [
        { title: `${name} — DPAL Archive` },
        {
          name: "description",
          content: `Curated ${name.toLowerCase()} resources in the DPAL archive.`,
        },
        { property: "og:title", content: `${name} — DPAL Archive` },
      ],
    };
  },
});

function CategoryPage() {
  const { category: catData } = Route.useLoaderData();
  const category = catData as import("@/data/directory").DirCategory;
  const total = category.subcategories.reduce(
    (n: number, s) => n + s.items.length,
    0,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader activeSlug={category.slug} />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-2 md:block">
          <CategorySidebar activeSlug={category.slug} />
        </aside>

        <main className="min-w-0 flex-1">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/directory" className="hover:text-accent">
              Archive
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          <div className="mt-3">
            <h1 className="font-heading text-4xl md:text-5xl">{category.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {category.subcategories.length} sections · {total.toLocaleString()} entries
            </p>
          </div>

          {category.subcategories.length > 6 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {category.subcategories.map((s) => (
                <a
                  key={s.name}
                  href={`#${encodeURIComponent(s.name)}`}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {s.name}
                </a>
              ))}
            </div>
          )}

          <div className="mt-10 space-y-14">
            {category.subcategories.map((s) => (
              <section key={s.name} id={encodeURIComponent(s.name)} className="scroll-mt-20">
                <div className="mb-4 flex items-baseline justify-between border-b border-white/5 pb-2">
                  <h2 className="font-heading text-2xl">{s.name}</h2>
                  <span className="text-xs text-muted-foreground">{s.items.length} entries</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {s.items.map((item, i) => (
                    <EntryCard key={i} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <AudioToggle />
    </div>
  );
}
