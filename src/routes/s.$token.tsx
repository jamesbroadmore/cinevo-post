import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/cinevo/logo";
import { openShare, type SharedTitle } from "@/lib/sharing";
import { remoteTitle } from "@/lib/library";
import { useCinevo } from "@/lib/cinevo-store";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/s/$token")({ component: SharedInvite });

function SharedInvite() {
  const { token } = Route.useParams();
  const addRemoteTitles = useCinevo((s) => s.addRemoteTitles);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [pack, setPack] = useState<{
    ownerUsername: string;
    ownerDisplay: string;
    guestName: string;
    titles: SharedTitle[];
    libraries: string[];
    expiresAt: string;
  } | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let live = true;
    void openShare({ data: { token } })
      .then((res) => {
        if (!live) return;
        if (!res.ok) setError(res.error);
        else setPack(res);
      })
      .catch(() => {
        if (live) setError("Could not open that invite.");
      })
      .finally(() => {
        if (live) setPending(false);
      });
    return () => {
      live = false;
    };
  }, [token]);

  const accept = () => {
    if (!pack) return;
    const titles = pack.titles.map((t) =>
      remoteTitle({
        id: `shared-${t.id}`,
        title: t.title,
        year: t.year,
        kind: t.kind === "series" ? "series" : "movie",
        synopsis: t.synopsis,
        source: "shared",
        sourceLabel: `${pack.ownerUsername} · ${t.sourceLabel}`,
        genre: t.genre,
      }),
    );
    addRemoteTitles(titles, {
      id: `shared-${token}`,
      kind: "shared",
      name: `@${pack.ownerUsername}`,
      selected: true,
      count: titles.length,
    });
    setAdded(true);
  };

  return (
    <main className="min-h-screen bg-cine-bg px-5 py-16 text-cine-text">
      <div className="mx-auto max-w-2xl">
        <Link to="/">
          <Logo size="lg" layout="stacked" />
        </Link>
        {pending ? <p className="mt-10 text-cine-muted">Opening invite…</p> : null}
        {error ? <p className="mt-10 text-cine-danger">{error}</p> : null}
        {pack ? (
          <>
            <p className="mt-10 font-ui text-xs font-semibold tracking-[0.12em] text-cine-cyan">CINEVO · SHARED LIBRARY</p>
            <h1 className="mt-3 font-ui text-4xl font-semibold leading-tight tracking-tight">
              @{pack.ownerUsername} opened a house for you.
            </h1>
            <p className="mt-4 text-cine-muted">
              {pack.titles.length} titles from {pack.libraries.join(", ") || "their library"}. Playback stays on their
              Plex or Jellyfin — CINEVO only shares the index.
            </p>
            <ul className="mt-8 grid gap-2">
              {pack.titles.slice(0, 12).map((t) => (
                <li key={t.id} className="rounded-xl bg-cine-elevated px-4 py-3">
                  <b className="font-ui">{t.title}</b>
                  <span className="ml-2 font-mono text-xs text-cine-faint">
                    {t.year} · {t.source}
                  </span>
                </li>
              ))}
            </ul>
            {added ? (
              <Link to="/app" className="house-btn house-btn--play mt-8 inline-flex">
                Open in CINEVO
              </Link>
            ) : (
              <>
                <SignedIn>
                  <button type="button" onClick={accept} className="house-btn house-btn--play mt-8">
                    Add to my house
                  </button>
                </SignedIn>
                <SignedOut>
                  <Link to="/login" search={{ mode: "in" }} className="house-btn house-btn--play mt-8 inline-flex">
                    Sign in to accept
                  </Link>
                </SignedOut>
              </>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
