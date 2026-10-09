/** Why a TV cannot take this playback. Null means the stream URL is worth offering. */
export type CastBlock = "local" | "loopback";

export type WirelessVideo = HTMLVideoElement & {
  webkitShowPlaybackTargetPicker?: () => void;
  webkitCurrentPlaybackTargetIsWireless?: boolean;
};

function hostOf(href: string): string {
  return new URL(href).hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

/** A cast target fetches the stream on its own. Blob files and loopback pages never reach a TV. */
export function castBlock(file: string | undefined, pageHref: string): CastBlock | null {
  if (!file || file.startsWith("blob:") || file.startsWith("data:")) return "local";
  let href = file;
  try {
    href = new URL(file, pageHref).href;
    const host = hostOf(href);
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return "loopback";
  } catch {
    return "loopback";
  }
  return null;
}
