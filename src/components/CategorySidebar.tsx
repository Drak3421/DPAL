import { Link } from "@tanstack/react-router";
import { categoryStats } from "@/data/directory";

export function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const cats = categoryStats();
  return (
    <nav className="flex flex-col gap-0.5 text-sm">
      <Link
        to="/directory"
        activeOptions={{ exact: true }}
        className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
        data-active={!activeSlug ? "true" : "false"}
      >
        All Categories
      </Link>
      {cats.map((c) => (
        <Link
          key={c.slug}
          to="/category/$category"
          params={{ category: c.slug }}
          className="flex items-center justify-between rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
          data-active={activeSlug === c.slug ? "true" : "false"}
        >
          <span className="truncate">{c.name}</span>
          <span className="ml-2 shrink-0 text-[10px] tabular-nums opacity-60">{c.itemCount}</span>
        </Link>
      ))}
    </nav>
  );
}
