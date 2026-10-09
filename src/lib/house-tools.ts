import type { Title } from "./catalog";

export type TitlePatch = {
  title?: string;
  year?: string;
  genre?: string;
  synopsis?: string;
};

export type Collection = {
  id: string;
  name: string;
  titleIds: string[];
};

export type Marker = {
  id: string;
  titleId: string;
  label: string;
  at: number;
};

export type PlayLog = {
  id: string;
  titleId: string;
  at: number;
};

export function applyTitlePatch<T extends Title>(title: T, patch?: TitlePatch): T {
  if (!patch) return title;
  return {
    ...title,
    title: patch.title?.trim() || title.title,
    year: patch.year?.trim() || title.year,
    genre: patch.genre?.trim() || title.genre,
    synopsis: patch.synopsis?.trim() || title.synopsis,
  };
}

export function duplicateGroups(titles: Title[]) {
  const groups = new Map<string, Title[]>();
  for (const title of titles) {
    const key = `${title.title.toLowerCase().replace(/\s+/g, " ").trim()}|${title.year}`;
    const list = groups.get(key) ?? [];
    list.push(title);
    groups.set(key, list);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

export function tasteFrom(titles: Title[], favorites: string[], progress: Record<string, number>) {
  const counts = new Map<string, number>();
  for (const title of titles) {
    const weight = (favorites.includes(title.id) ? 2 : 0) + ((progress[title.id] ?? 0) > 0 ? 1 : 0);
    if (!weight) continue;
    for (const genre of title.genres?.length ? title.genres : [title.genre]) {
      if (!genre) continue;
      counts.set(genre, (counts.get(genre) ?? 0) + weight);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));
}

export function mostPlayed(titles: Title[], plays: PlayLog[], limit = 8) {
  const counts = new Map<string, number>();
  for (const play of plays) counts.set(play.titleId, (counts.get(play.titleId) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ title: titles.find((t) => t.id === id), count }))
    .filter((row): row is { title: Title; count: number } => Boolean(row.title))
    .slice(0, limit);
}

export function renamePreview(title: Title, pattern: string) {
  return pattern
    .replaceAll("{title}", title.title)
    .replaceAll("{year}", title.year || "")
    .replaceAll("{genre}", title.genre || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function peopleIn(titles: Title[], query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return titles
    .filter((title) => {
      const names = [title.director, ...(title.cast ?? [])].join(" ").toLowerCase();
      return names.includes(q);
    })
    .slice(0, 12);
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
