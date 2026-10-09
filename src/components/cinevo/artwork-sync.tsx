import { useEffect, useRef } from "react";
import { artProxyUrl } from "@/lib/artwork-model";
import { refreshLibraryArt } from "@/lib/artwork";
import { useCinevo } from "@/lib/cinevo-store";
import { loadThumbs } from "@/lib/folder-handles";

function sameLibrary(sourceName: string, label: string) {
  if (label === sourceName) return true;
  const handle = sourceName.replace(/^@/, "");
  return label.startsWith(`${handle} ·`) || label.startsWith(`${sourceName} ·`);
}

export function ArtworkSync() {
  const hydrated = useCinevo((s) => s.hydrated);
  const sources = useCinevo((s) => s.sources);
  const remote = useCinevo((s) => s.remoteTitles);
  const local = useCinevo((s) => s.localTitles);
  const clientId = useCinevo((s) => s.plexClientId);
  const remoteKey = remote
    .filter((title) => title.source === "plex" || title.source === "jellyfin")
    .map((title) => title.id)
    .join(",");
  const localKey = local.map((title) => title.id).join(",");
  const ranRemote = useRef("");
  const ranLocal = useRef("");

  useEffect(() => {
    if (!hydrated || !localKey || ranLocal.current === localKey) return;
    ranLocal.current = localKey;
    void loadThumbs(localKey.split(",").filter(Boolean)).then((saved) => {
      useCinevo.getState().patchArtwork(Object.entries(saved).map(([id, url]) => ({ id, poster: url, still: url })));
    });
  }, [hydrated, localKey]);

  useEffect(() => {
    if (!hydrated || !remoteKey || ranRemote.current === remoteKey) return;
    ranRemote.current = remoteKey;
    const targets = sources.filter((source) => (source.kind === "plex" || source.kind === "jellyfin") && source.baseUrl && source.accessToken);
    void (async () => {
      for (const source of targets) {
        const keys = remote
          .filter((title) => title.source === source.kind && sameLibrary(source.name, title.sourceLabel))
          .map((title) => title.path || title.id)
          .filter(Boolean)
          .slice(0, 80);
        if (!keys.length || !source.baseUrl || !source.accessToken) continue;
        try {
          const res = await refreshLibraryArt({
            data: {
              provider: source.kind === "jellyfin" ? "jellyfin" : "plex",
              uri: source.baseUrl,
              token: source.accessToken,
              clientId: clientId || "cinevo-web",
              userServerId: source.userId,
              keys,
            },
          });
          if (!res.ok) continue;
          useCinevo.getState().patchArtwork(
            res.items.map((item) => ({
              id: item.id,
              poster: item.posterPath ? artProxyUrl(res.ticket, item.posterPath) : undefined,
              still: item.stillPath ? artProxyUrl(res.ticket, item.stillPath) : undefined,
              synopsis: item.synopsis,
              year: item.year,
              runtime: item.runtime,
              rating: item.rating,
              genre: item.genre,
              genres: item.genres,
              cast: item.cast,
              director: item.director,
            })),
          );
        } catch {
          /* the server is not reachable from here */
        }
      }
    })();
  }, [clientId, hydrated, remote, remoteKey, sources]);

  return null;
}
