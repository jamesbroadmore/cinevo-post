export type PlexConnectionPayload = {
  baseUrl: string;
  token: string;
};

export type JellyfinConnectionPayload = {
  baseUrl: string;
  username: string;
  password: string;
};

function parseUrl(value: string, label: string) {
  const candidate = value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`Add a complete ${label} address`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Use an http or https ${label} address`);
  }
  if (url.username || url.password) {
    throw new Error("Do not put credentials in the address");
  }
  url.search = "";
  url.hash = "";
  return url;
}

export function isLoopbackHost(value: string) {
  try {
    const host = new URL(value.startsWith("http") ? value : `https://${value}`).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
  } catch {
    return false;
  }
}

/**
 * Accepts a Plex XML/info URL containing X-Plex-Token, or a manual address + token.
 * Values are for immediate submission only — this helper never persists them.
 */
export function buildPlexConnectionPayload(input: {
  connectionLink: string;
  baseUrl: string;
  token: string;
}): PlexConnectionPayload {
  const connectionLink = input.connectionLink.trim();
  if (connectionLink) {
    const candidate = connectionLink.startsWith("http") ? connectionLink : `https://${connectionLink}`;
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      throw new Error("That Plex link is not a valid address");
    }
    const token = url.searchParams.get("X-Plex-Token") || url.searchParams.get("x-plex-token");
    if (!token) throw new Error("That link is missing an X-Plex-Token. Use the manual option instead.");
    url.search = "";
    url.hash = "";
    url.pathname = "/";
    return { baseUrl: url.toString().replace(/\/$/, ""), token };
  }

  const token = input.token.trim();
  if (!token) throw new Error("Add a Plex access token or paste a Plex connection link");
  const url = parseUrl(input.baseUrl, "Plex server");
  return { baseUrl: url.toString().replace(/\/$/, ""), token };
}

export function buildJellyfinConnectionPayload(input: JellyfinConnectionPayload): JellyfinConnectionPayload {
  const username = input.username.trim();
  if (!username) throw new Error("Add your Jellyfin username");
  if (!input.password) throw new Error("Add your Jellyfin password");
  const url = parseUrl(input.baseUrl, "Jellyfin library");
  return { baseUrl: url.toString().replace(/\/$/, ""), username, password: input.password };
}
