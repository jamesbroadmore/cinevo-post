import { useEffect, useRef } from "react";
import { titleById, useCinevo } from "@/lib/cinevo-store";
import { useLibrary } from "@/lib/use-library";
import type { RemoteCommand, RemoteNow } from "@/lib/remote-protocol";
import { openHouseRemote, readHouseCode, syncHouseRemote, writeHouseCode } from "@/lib/remote-client";

function snapshot(library: ReturnType<typeof useLibrary>): RemoteNow {
  const state = useCinevo.getState();
  const current = titleById(state.playingId);
  const video = document.querySelector<HTMLVideoElement>("video[data-cinevo-player]");
  const duration = video && Number.isFinite(video.duration) ? video.duration : 0;
  const position = duration > 0 && video ? (video.currentTime / duration) * 100 : current ? state.progress[current.id] ?? 0 : 0;
  const volume = video ? (video.muted ? 0 : video.volume) : 1;
  const rest = library.filter((item) => item.id !== current?.id).slice(0, current ? 23 : 24);
  const titles = [
    ...(current ? [{ id: current.id, name: current.title }] : []),
    ...rest.map((item) => ({ id: item.id, name: item.title })),
  ];
  return {
    title: current?.title ?? "",
    detail: current ? [current.year, current.kind === "series" ? "Series" : "Movie"].filter(Boolean).join(" · ") : "",
    playing: Boolean(state.playing && current),
    position,
    volume,
    titles,
  };
}

function apply(commands: RemoteCommand[]) {
  for (const command of commands) {
    window.dispatchEvent(new CustomEvent("cinevo-remote", { detail: command }));
  }
}

export function RemoteBridge() {
  const library = useLibrary();
  const libraryRef = useRef(library);
  libraryRef.current = library;

  useEffect(() => {
    let stop = false;
    let code = readHouseCode();
    let timer = 0;

    const tick = async () => {
      if (stop || !code) return;
      try {
        const res = await syncHouseRemote(code, snapshot(libraryRef.current));
        if (res.ok && res.commands?.length) apply(res.commands);
      } catch {
        /* the next tick retries */
      }
    };

    const start = async () => {
      try {
        const res = await openHouseRemote(code);
        if (stop) return;
        if (res.ok && res.code) {
          code = res.code;
          writeHouseCode(res.code);
        }
      } catch {
        /* pairing retries if the house is still open */
      }
      if (stop || !code) return;
      await tick();
      timer = window.setInterval(() => void tick(), 1200);
    };

    void start();
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
