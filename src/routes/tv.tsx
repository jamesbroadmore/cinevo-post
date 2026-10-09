import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { renderSVG } from "uqr";
import { Logo } from "@/components/cinevo/logo";
import { authClient, getBearerToken, rememberSessionToken } from "@/lib/auth/client";

export const Route = createFileRoute("/tv")({
  component: TvPage,
  head: () => ({
    meta: [
      { title: "CINEVO TV" },
      { name: "description", content: "Play CINEVO on a television. Sign in with a QR code. A phone can remote-control this screen." },
      { name: "theme-color", content: "#050505" },
    ],
  }),
});

function TvPage() {
  const navigate = useNavigate();
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.tv = "1";
    try {
      sessionStorage.setItem("cinevo-tv", "1");
    } catch {
      /* ignore */
    }
    return () => {
      delete document.documentElement.dataset.tv;
    };
  }, []);

  useEffect(() => {
    let stop = false;
    const enter = () => {
      if (!stop) void navigate({ to: "/app" });
    };
    if (getBearerToken()) {
      enter();
      return;
    }
    void authClient.getSession().then((res) => {
      if (res.data?.user) enter();
    });
    let secret = "";
    let timer = 0;
    void fetch("/api/passkey", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "desk" }),
    })
      .then((res) => res.json())
      .then((data: { secret?: string; error?: string }) => {
        if (stop) return;
        if (!data.secret) {
          setError(data.error || "Could not start a sign-in code.");
          return;
        }
        secret = data.secret;
        const url = `${window.location.origin}/login?desk=${data.secret}`;
        setQr(renderSVG(url, { ecc: "M", border: 2, pixelSize: 6, blackColor: "#050505", whiteColor: "#f4fbff" }));
        timer = window.setInterval(() => {
          void fetch(`/api/passkey?desk=${encodeURIComponent(secret)}`, { cache: "no-store" })
            .then((res) => res.json())
            .then((row: { status?: string; token?: string }) => {
              if (row.status === "approved" && row.token) {
                window.clearInterval(timer);
                rememberSessionToken(row.token);
                enter();
              }
            })
            .catch(() => undefined);
        }, 2000);
      })
      .catch(() => {
        if (!stop) setError("Could not start a sign-in code.");
      });
    return () => {
      stop = true;
      if (timer) window.clearInterval(timer);
    };
  }, [navigate]);

  return (
    <main className="tv-lobby">
      <header>
        <Logo size="lg" />
      </header>
      <section>
        <p className="tv-kicker">TELEVISION</p>
        <h1>Sign in with your phone</h1>
        <p>Scan the code with a phone that is already in this house. This screen then plays your library. A TV remote moves the highlight. The CINEVO phone app can pause, seek, and pick a title.</p>
        {error ? <p className="text-cine-danger">{error}</p> : null}
        {qr ? <div className="tv-qr" dangerouslySetInnerHTML={{ __html: qr }} /> : <div className="tv-qr tv-qr--wait" />}
      </section>
    </main>
  );
}
