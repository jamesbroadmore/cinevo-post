import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import { serverAddressError } from "@/lib/playback-urls";
import { factsFromJellyfin } from "@/lib/artwork-model";

type JellyfinItem = {
  Id?: string;
  Name?: string;
  Type?: string;
  ProductionYear?: number;
  PremiereDate?: string;
  Overview?: string;
  Genres?: string[];
  CommunityRating?: number;
  CollectionType?: string;
  RunTimeTicks?: number;
  People?: { Name?: string; Type?: string }[];
  ImageTags?: { Primary?: string };
  BackdropImageTags?: string[];
};

function authHeader(deviceId: string, token?: string) {
  const parts = [
    `Client="CINEVO"`,
    `Device="Web"`,
    `DeviceId="${deviceId}"`,
    `Version="1.0.0"`,
  ];
  if (token) parts.push(`Token="${token}"`);
  return `MediaBrowser ${parts.join(", ")}`;
}

async function jfFetch(url: string, headers: Record<string, string>, init: RequestInit = {}, ms = 10000) {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(ms),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("Jellyfin could not verify those details.");
    throw new Error(String(data.message || data.error || `Jellyfin returned ${res.status}`));
  }
  return data;
}

const shortString = z.string().trim().min(1).max(512);
const connectionSchema = z.object({
  baseUrl: z.string().trim().max(2048),
  token: shortString,
  userId: shortString,
  clientId: z.string().trim().min(1).max(128),
});
const connectSchema = z.object({
  baseUrl: z.string().trim().max(2048),
  username: z.string().trim().min(1).max(320),
  password: z.string().max(1024),
  clientId: z.string().trim().max(128),
});
const importSchema = connectionSchema.extend({
  sourceLabel: z.string().trim().min(1).max(120),
  sectionKeys: z.array(z.string().trim().min(1).max(128)).max(12),
});

function normalizeBase(url: string) {
  const normalized = url.trim().replace(/\/$/, "");
  return serverAddressError(normalized) ? null : normalized;
}

export const jellyfinConnect = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input) => connectSchema.parse(input))
  .handler(async ({ data }) => {
    const baseUrl = normalizeBase(data.baseUrl);
    if (!baseUrl) return { ok: false as const, error: "That Jellyfin server address is not allowed." };
    const deviceId = data.clientId.trim() || "cinevo-web";
    try {
      const body = await jfFetch(
        `${baseUrl}/Users/AuthenticateByName`,
        {
          "Content-Type": "application/json",
          "X-Emby-Authorization": authHeader(deviceId),
        },
        { method: "POST", body: JSON.stringify({ Username: data.username.trim(), Pw: data.password }) },
        12000,
      );
      const user = (body.User ?? {}) as { Id?: string; Name?: string };
      const token = String(body.AccessToken || "");
      if (!token || !user.Id) return { ok: false as const, error: "Jellyfin did not return a usable session." };
      return {
        ok: true as const,
        token,
        userId: String(user.Id),
        username: String(user.Name || data.username),
        baseUrl,
      };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not reach that Jellyfin library from here.",
      };
    }
  });

export const jellyfinListSections = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input) => connectionSchema.parse(input))
  .handler(async ({ data }) => {
    const baseUrl = normalizeBase(data.baseUrl);
    if (!baseUrl) return { ok: false as const, error: "That Jellyfin server address is not allowed." };
    try {
      const body = await jfFetch(
        `${baseUrl}/Users/${encodeURIComponent(data.userId)}/Views`,
        { "X-Emby-Authorization": authHeader(data.clientId, data.token) },
      );
      const items = (Array.isArray(body.Items) ? body.Items : []) as JellyfinItem[];
      const sections = items
        .filter((item) => {
          const kind = String(item.CollectionType || item.Type || "").toLowerCase();
          return kind.includes("movie") || kind.includes("tv") || kind.includes("series") || !kind;
        })
        .map((item) => ({
          key: String(item.Id || ""),
          title: String(item.Name || "Library"),
          type: String(item.CollectionType || item.Type || ""),
        }))
        .filter((s) => s.key);
      return { ok: true as const, sections };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not list Jellyfin libraries.",
      };
    }
  });

export const jellyfinImportSections = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input) => importSchema.parse(input))
  .handler(async ({ data }) => {
    const baseUrl = normalizeBase(data.baseUrl);
    if (!baseUrl) return { ok: false as const, error: "That Jellyfin server address is not allowed." };
    const headers = { "X-Emby-Authorization": authHeader(data.clientId, data.token) };
    const titles: {
      id: string;
      title: string;
      year: string;
      kind: "movie" | "series";
      synopsis: string;
      genre: string;
      genres: string[];
      runtime: string;
      rating: number;
      cast: string[];
      director: string;
      sourceLabel: string;
      path: string;
    }[] = [];
    try {
      for (const key of data.sectionKeys.slice(0, 12)) {
        const params = new URLSearchParams({
          ParentId: key,
          IncludeItemTypes: "Movie,Series",
          Recursive: "true",
          Fields: "Overview,Genres,People,ProductionYear,PremiereDate,CommunityRating,RunTimeTicks,ImageTags,BackdropImageTags",
          Limit: "80",
          SortBy: "DateCreated",
          SortOrder: "Descending",
        });
        const body = await jfFetch(
          `${baseUrl}/Users/${encodeURIComponent(data.userId)}/Items?${params}`,
          headers,
          {},
          12000,
        );
        const items = (Array.isArray(body.Items) ? body.Items : []) as JellyfinItem[];
        for (const item of items.slice(0, 80)) {
          const facts = factsFromJellyfin(item);
          titles.push({
            id: `jellyfin-${item.Id || item.Name}`,
            title: String(item.Name || "Untitled"),
            year: facts.year || (item.ProductionYear ? String(item.ProductionYear) : ""),
            kind: String(item.Type || "") === "Series" ? "series" : "movie",
            synopsis: facts.synopsis,
            genre: facts.genre || "Jellyfin",
            genres: facts.genres,
            runtime: facts.runtime,
            rating: facts.rating,
            cast: facts.cast,
            director: facts.director,
            sourceLabel: data.sourceLabel,
            path: String(item.Id || ""),
          });
        }
      }
      const seen = new Set<string>();
      const unique = titles.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
      return { ok: true as const, titles: unique };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Could not import that Jellyfin library.",
      };
    }
  });
