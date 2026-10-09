/** Hosts the broker and this app will accept as an OAuth callback origin. */
const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);

export function isAllowedOAuthHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (LOOPBACK.has(host)) return true;
  return host.endsWith(".grok-sandbox.com") || host.endsWith(".vercel.app");
}

function hostnameOf(hostHeader: string): string {
  if (hostHeader.startsWith("[")) {
    const end = hostHeader.indexOf("]");
    return end > 0 ? hostHeader.slice(1, end) : hostHeader;
  }
  return hostHeader.replace(/:\d+$/, "");
}

function requestHost(headers: Headers): string {
  const raw = headers.get("x-forwarded-host") || headers.get("host") || "";
  return raw.split(",")[0]?.trim() ?? "";
}

/**
 * The browser origin to use for the OAuth redirect.
 * A public host already on the request wins. Loopback (the sandbox proxy)
 * may be replaced by the page origin so the broker sends the user back
 * to the same window that started sign-in.
 */
export function resolveOAuthPublicOrigin(headers: Headers, hintedOrigin: string | null): URL | null {
  const incomingName = hostnameOf(requestHost(headers)).toLowerCase();
  if (incomingName && isAllowedOAuthHost(incomingName) && !LOOPBACK.has(incomingName)) return null;
  if (!hintedOrigin) return null;
  let url: URL;
  try {
    url = new URL(hintedOrigin);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.pathname !== "/" && url.pathname !== "") return null;
  if (!isAllowedOAuthHost(url.hostname)) return null;
  const loopback = LOOPBACK.has(url.hostname.toLowerCase());
  if (loopback && url.protocol !== "http:") return null;
  if (loopback && url.port !== "8080") return null;
  return url;
}

export function headersForOAuth(headers: Headers, hintedOrigin: string | null): Headers {
  const next = new Headers(headers);
  const origin = resolveOAuthPublicOrigin(headers, hintedOrigin);
  if (!origin) return next;
  next.set("x-forwarded-host", origin.host);
  next.set("x-forwarded-proto", origin.protocol.replace(":", ""));
  return next;
}
