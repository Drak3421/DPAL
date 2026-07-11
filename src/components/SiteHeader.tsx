import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategorySidebar } from "./CategorySidebar";

export function SiteHeader({
  activeSlug,
  onSearch,
  defaultQuery = "",
}: {
  activeSlug?: string;
  onSearch?: (q: string) => void;
  defaultQuery?: string;
}) {
  const [q, setQ] = useState(defaultQuery);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) {
      onSearch(q);
    } else {
      navigate({ to: "/directory", search: { q } });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl leading-none tracking-tight text-foreground">
              DPAL
            </span>
            <span className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
              Archive
            </span>
          </Link>

          <form onSubmit={handleSubmit} className="ml-auto flex-1 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder="Search the archive…  (press /)"
                className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-white/[0.07] focus:outline-none"
              />
            </div>
          </form>

          <Link
            to="/directory"
            className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent md:inline-block"
          >
            Browse
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-white/10 bg-background p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-xl">Categories</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CategorySidebar activeSlug={activeSlug} />
          </aside>
        </div>
      )}
    </>
  );
}
