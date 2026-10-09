import { useEffect, useState } from "react";
import { InstallCinevo, rememberInstallPrompt } from "./house-remote";

export function Pwa() {
  const [dismissed, setDismissed] = useState(true);
  const [offer, setOffer] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("cinevo-install-hide") === "1");
    } catch {
      setDismissed(false);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      rememberInstallPrompt(event as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> });
    };
    const onReady = () => setOffer(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("cinevo-install", onReady);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("cinevo-install", onReady);
    };
  }, []);

  if (dismissed) return null;
  const path = window.location.pathname;
  if (path !== "/") return null;
  const wide = window.matchMedia("(min-width: 900px)").matches;
  if (wide && !offer) return null;

  return (
    <div className="install-bar">
      <InstallCinevo compact />
      <button
        type="button"
        className="install-bar__close"
        aria-label="Dismiss install hint"
        onClick={() => {
          try {
            sessionStorage.setItem("cinevo-install-hide", "1");
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
      >
        Not now
      </button>
    </div>
  );
}
