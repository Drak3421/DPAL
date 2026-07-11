import { ExternalLink, Star } from "lucide-react";
import type { DirItem } from "@/data/directory";

export function EntryCard({ item }: { item: DirItem }) {
  const primary = item.links[0];
  const extra = item.links.slice(1);
  if (!primary) return null;

  const isExternal = /^https?:\/\//i.test(primary.url);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_-8px_var(--accent)]">
      <div className="flex items-start justify-between gap-2">
        <a
          href={primary.url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent"
        >
          <span className="line-clamp-1">{primary.name}</span>
          {isExternal && <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />}
        </a>
        {item.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />}
      </div>

      {item.description && item.description.trim().length > 1 && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}

      {extra.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {extra.map((l) => {
            const ext = /^https?:\/\//i.test(l.url);
            return (
              <a
                key={l.url + l.name}
                href={l.url}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                {l.name}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
