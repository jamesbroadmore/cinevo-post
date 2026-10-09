import assert from "node:assert/strict";
import test from "node:test";
import {
  buildJellyfinConnectionPayload,
  buildPlexConnectionPayload,
  isLoopbackHost,
} from "./connection-assistant.ts";

test("extracts token from a Plex info link", () => {
  const payload = buildPlexConnectionPayload({
    connectionLink: "https://media.example.com:32400/library/metadata/1?X-Plex-Token=abc123",
    baseUrl: "",
    token: "",
  });
  assert.equal(payload.baseUrl, "https://media.example.com:32400");
  assert.equal(payload.token, "abc123");
});

test("uses the manual address and token", () => {
  const payload = buildPlexConnectionPayload({
    connectionLink: "",
    baseUrl: "media.example.com:32400",
    token: "tok",
  });
  assert.equal(payload.baseUrl, "https://media.example.com:32400");
  assert.equal(payload.token, "tok");
});

test("rejects a link without a token", () => {
  assert.throws(
    () =>
      buildPlexConnectionPayload({
        connectionLink: "https://media.example.com/library/metadata/1",
        baseUrl: "",
        token: "",
      }),
    /X-Plex-Token/,
  );
});

test("normalises a Jellyfin host without a scheme", () => {
  const payload = buildJellyfinConnectionPayload({
    baseUrl: "jelly.example.com",
    username: "ada",
    password: "secret",
  });
  assert.equal(payload.baseUrl, "https://jelly.example.com");
  assert.equal(payload.username, "ada");
});

test("detects loopback hosts", () => {
  assert.equal(isLoopbackHost("http://127.0.0.1:8096"), true);
  assert.equal(isLoopbackHost("jelly.example.com"), false);
});
