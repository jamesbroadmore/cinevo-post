import { useEffect, useMemo, useState } from "react";
import { createShare, listMyShares, lookupUsername, setShareStatus, type ShareRow } from "@/lib/sharing";
import { useCinevo } from "@/lib/cinevo-store";
import { remoteTitle } from "@/lib/library";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { Link } from "@tanstack/react-router";

export function SharePanel() {
  const sources = useCinevo((s) => s.sources);
  const remoteTitles = useCinevo((s) => s.remoteTitles);
  const localTitles = useCinevo((s) => s.localTitles);
  const flash = useCinevo((s) => s.flash);
  const addRemoteTitles = useCinevo((s) => s.addRemoteTitles);
  const [guest, setGuest] = useState("");
  const [days, setDays] = useState(7);
  const [picked, setPicked] = useState<string[]>([]);
  const [outgoing, setOutgoing] = useState<ShareRow[]>([]);
  const [incoming, setIncoming] = useState<ShareRow[]>([]);
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState("");
  const [guestName, setGuestName] = useState("");

  const load = async () => {
    try {
      const res = await listMyShares();
      if (res.ok) {
        setOutgoing(res.outgoing);
        setIncoming(res.incoming);
      }
    } catch {
      /* signed out */
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const ownSources = useMemo(() => sources.filter((s) => s.kind !== "shared"), [sources]);

  useEffect(() => {
    if (ownSources.length && !picked.length) setPicked(ownSources.map((s) => s.id));
  }, [ownSources, picked.length]);

  const titles = useMemo(() => {
    const pool = [...remoteTitles, ...localTitles];
    const selected = ownSources.filter((s) => picked.includes(s.id));
    const names = new Set(selected.map((s) => s.name));
    return pool
      .filter((t) => names.has(t.sourceLabel) && t.source !== "shared")
      .map((t) => ({
        id: t.id,
        title: t.title,
        year: t.year,
        kind: t.kind,
        genre: t.genre,
        synopsis: t.synopsis,
        source: (t.source === "jellyfin" ? "jellyfin" : t.source === "folder" ? "folder" : "plex") as
          | "plex"
          | "jellyfin"
          | "folder",
        sourceLabel: t.sourceLabel,
      }));
  }, [localTitles, ownSources, picked, remoteTitles]);

  const send = async () => {
    setPending(true);
    try {
      const found = await lookupUsername({ data: { username: guest } });
      if (!found.ok) {
        flash(found.error);
        return;
      }
      const created = await createShare({
        data: { guestName: found.username, days, libraries: ownSources.filter((s) => picked.includes(s.id)).map((s) => s.name), titles },
      });
      if (!created.ok) {
        flash(created.error);
        return;
      }
      const url = `${window.location.origin}/s/${created.token}`;
      setLink(url);
      setGuestName(found.username);
      flash(`Invite sent to @${found.username}`);
      await load();
    } finally {
      setPending(false);
    }
  };

  const shareLink = async () => {
    if (!link) return;
    const data = {
      title: "CINEVO",
      text: `A CINEVO library invite for @${guestName || guest.replace(/^@/, "")}`,
      url: link,
    };
    const canShare = typeof navigator.share === "function" && (typeof navigator.canShare !== "function" || navigator.canShare(data));
    if (canShare) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      flash("Invite link copied");
    } catch {
      flash("Copy the invite link below");
    }
  };

  return (
    <div className="space-y-4">
      <SignedOut>
        <p className="text-sm text-cine-muted">
          Sign in and claim a username to share Plex and Jellyfin indexes with a friend.
        </p>
        <Link to="/login" search={{ mode: "in" }} className="house-btn house-btn--play inline-flex">
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <p className="text-sm text-cine-muted">
          Share the catalog — not the files. Playback stays on the original Plex or Jellyfin server.
        </p>
        <div className="grid gap-2">
          {ownSources.length ? (
            ownSources.map((s) => (
              <label key={s.id} className="flex min-h-11 items-center justify-between rounded-lg bg-cine-well px-3">
                <span className="font-ui text-sm">
                  {s.name} <small className="text-cine-faint">{s.kind}</small>
                </span>
                <input
                  type="checkbox"
                  className="size-5 accent-cine-cyan"
                  checked={picked.includes(s.id)}
                  onChange={(e) =>
                    setPicked((cur) => (e.target.checked ? [...cur, s.id] : cur.filter((id) => id !== s.id)))
                  }
                />
              </label>
            ))
          ) : (
            <p className="text-sm text-cine-faint">Connect a Plex, Jellyfin, or folder library first.</p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={guest}
            onChange={(e) => setGuest(e.target.value)}
            className="h-11 rounded-md border border-cine-border bg-cine-well px-3 font-ui"
            placeholder="@username"
            aria-label="Friend username"
          />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-11 rounded-md border border-cine-border bg-cine-well px-3 font-ui"
          >
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
          <button
            type="button"
            className="h-11 rounded-md bg-cine-magenta px-4 font-ui font-bold text-white"
            disabled={pending || !guest.trim() || !picked.length}
            onClick={() => void send()}
          >
            {pending ? "Sending…" : "Share libraries"}
          </button>
        </div>
        {link ? (
          <div className="grid gap-2">
            <p className="break-all rounded-lg bg-cine-surface px-3 py-2 font-mono text-xs text-cine-cyan">{link}</p>
            <button type="button" className="house-btn h-11" onClick={() => void shareLink()}>
              Share invite
            </button>
          </div>
        ) : null}
        {outgoing.length ? (
          <div className="space-y-2">
            <p className="font-ui text-xs font-semibold tracking-[0.1em] text-cine-cyan">SENT</p>
            {outgoing.map((i) => (
              <article key={i.id} className="flex items-center justify-between rounded-lg bg-cine-surface px-3 py-3">
                <span>
                  <b className="font-ui">@{i.guestName}</b>
                  <small className="ml-2 text-cine-faint">
                    {i.status} · {i.titles.length} titles · {i.days}d
                  </small>
                </span>
                <button
                  type="button"
                  className="font-ui text-sm text-cine-danger"
                  onClick={() => void setShareStatus({ data: { id: i.id, status: "revoked" } }).then(() => load())}
                >
                  Revoke
                </button>
              </article>
            ))}
          </div>
        ) : null}
        {incoming.length ? (
          <div className="space-y-2">
            <p className="font-ui text-xs font-semibold tracking-[0.1em] text-cine-cyan">SHARED WITH YOU</p>
            {incoming.map((i) => (
              <article key={i.id} className="flex items-center justify-between gap-3 rounded-lg bg-cine-surface px-3 py-3">
                <Link to="/s/$token" params={{ token: i.token }} className="min-w-0">
                  <b className="font-ui">@{i.ownerUsername || "CINEVO member"}</b>
                  <small className="ml-2 text-cine-faint">
                    {i.titles.length} titles · {i.libraries.join(" · ")}
                  </small>
                </Link>
                <button
                  type="button"
                  className="shrink-0 font-ui text-sm font-bold text-cine-cyan"
                  onClick={() => {
                    const titles = i.titles.map((t) =>
                      remoteTitle({
                        id: `shared-${t.id}`,
                        title: t.title,
                        year: t.year,
                        kind: t.kind === "series" ? "series" : "movie",
                        synopsis: t.synopsis,
                        source: "shared",
                        sourceLabel: `${i.ownerUsername || "friend"} · ${t.sourceLabel}`,
                        genre: t.genre,
                      }),
                    );
                    addRemoteTitles(titles, {
                      id: `shared-${i.token}`,
                      kind: "shared",
                      name: `@${i.ownerUsername || "friend"}`,
                      selected: true,
                      count: titles.length,
                    });
                  }}
                >
                  Add
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </SignedIn>
    </div>
  );
}
