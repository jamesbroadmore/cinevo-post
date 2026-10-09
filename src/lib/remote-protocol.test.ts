import assert from "node:assert/strict";
import test from "node:test";
import { formatCode, normalizeCode, sanitizeCommand, sanitizeNow } from "./remote-protocol.ts";

test("codes ignore dashes and reject the wrong length", () => {
  assert.equal(normalizeCode("abc-def"), "ABCDEF");
  assert.equal(formatCode("abcdef"), "ABC-DEF");
  assert.equal(normalizeCode("ab"), "");
  assert.equal(normalizeCode("abc defg"), "");
});

test("now-playing drops paths and keeps a short title list", () => {
  const now = sanitizeNow({
    title: "  Night\nDrive ",
    detail: "2024 · movie",
    playing: true,
    position: 140,
    volume: 2,
    titles: [
      { id: "../secret.mkv", name: "Night Drive" },
      { id: "", name: "skip" },
      { id: "plex-1", name: "Real title" },
    ],
  });
  assert.equal(now.title, "Night Drive");
  assert.equal(now.position, 100);
  assert.equal(now.volume, 1);
  assert.equal(now.titles.length, 2);
  assert.equal(now.titles[0].name, "Night Drive");
});

test("commands only allow playback controls", () => {
  assert.deepEqual(sanitizeCommand({ type: "pause" })?.type, "pause");
  assert.equal(sanitizeCommand({ type: "seek", by: 10 })?.type, "seek");
  assert.equal(sanitizeCommand({ type: "seek" }), null);
  assert.equal(sanitizeCommand({ type: "openFile", titleId: "/etc/passwd" }), null);
  const play = sanitizeCommand({ type: "playTitle", titleId: "plex-9" });
  assert.equal(play && play.type === "playTitle" ? play.titleId : "", "plex-9");
});
