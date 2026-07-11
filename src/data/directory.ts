import raw from "./directory.json";
import { slugify } from "@/lib/slug";

export type DirLink = { name: string; url: string };
export type DirItem = { links: DirLink[]; description: string; starred: boolean };
export type DirSubcategory = { name: string; items: DirItem[] };
export type DirCategory = { name: string; slug: string; subcategories: DirSubcategory[] };

const data = raw as Array<{
  name: string;
  subcategories: Array<{ name: string; items: DirItem[] }>;
}>;

export const categories: DirCategory[] = data.map((c) => ({
  name: c.name,
  slug: slugify(c.name),
  subcategories: c.subcategories.map((s) => ({
    name: s.name.trim(),
    items: s.items,
  })),
}));

export function findCategory(slug: string): DirCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export type FlatEntry = {
  category: string;
  categorySlug: string;
  subcategory: string;
  item: DirItem;
};

let flatCache: FlatEntry[] | null = null;
export function allEntries(): FlatEntry[] {
  if (flatCache) return flatCache;
  const out: FlatEntry[] = [];
  for (const c of categories) {
    for (const s of c.subcategories) {
      for (const item of s.items) {
        out.push({ category: c.name, categorySlug: c.slug, subcategory: s.name, item });
      }
    }
  }
  flatCache = out;
  return out;
}

export function categoryStats() {
  return categories.map((c) => ({
    ...c,
    itemCount: c.subcategories.reduce((n, s) => n + s.items.length, 0),
  }));
}

export function searchEntries(query: string, limit = 100): FlatEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: FlatEntry[] = [];
  for (const e of allEntries()) {
    const hay =
      e.item.links.map((l) => l.name).join(" ") + " " + e.item.description + " " + e.subcategory;
    if (hay.toLowerCase().includes(q)) {
      out.push(e);
      if (out.length >= limit) break;
    }
  }
  return out;
}
