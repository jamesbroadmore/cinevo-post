import assert from "node:assert/strict";
import test from "node:test";
import { factsFromJellyfin, factsFromPlex, formatRuntime, normalizeRating, safeArtPath } from "./artwork-model.ts";

test("runtime and rating stay in house units", () => {
  assert.equal(formatRuntime(5_520_000), "1h 32m");
  assert.equal(formatRuntime(0), "");
  assert.equal(normalizeRating(8.2), 8.2);
  assert.equal(normalizeRating(0.82), 8.2);
  assert.equal(normalizeRating(82), 8.2);
});

test("artwork paths stay on the media server", () => {
  assert.equal(safeArtPath("/library/metadata/9/thumb"), "/library/metadata/9/thumb");
  assert.equal(safeArtPath("/Items/abc/Images/Primary?maxWidth=480&quality=80"), "/Items/abc/Images/Primary?maxWidth=480&quality=80");
  assert.equal(safeArtPath("https://evil.example/library/metadata/1/thumb"), null);
  assert.equal(safeArtPath("/library/metadata/../admin"), null);
});

test("plex and jellyfin facts include cover and backdrop", () => {
  const plex = factsFromPlex(
    {
      summary: "A night drive.",
      year: 1999,
      duration: 7_200_000,
      rating: 7.5,
      Genre: [{ tag: "Drama" }],
      Role: [{ tag: "Ada Voss" }],
      Director: [{ tag: "Jon Pike" }],
      thumb: "/library/metadata/9/thumb/1",
      art: "/library/metadata/9/art/2",
    },
    "9",
  );
  assert.equal(plex.director, "Jon Pike");
  assert.equal(plex.runtime, "2h");
  assert.equal(plex.posterPath, "/library/metadata/9/thumb/1");
  assert.equal(plex.stillPath, "/library/metadata/9/art/2");
  const jelly = factsFromJellyfin({
    Id: "abc",
    Overview: "Harbor.",
    ProductionYear: 2004,
    RunTimeTicks: 5_400_000_000_0,
    CommunityRating: 6,
    Genres: ["Drama"],
    People: [
      { Name: "Mina Cole", Type: "Actor" },
      { Name: "Ada Voss", Type: "Director" },
    ],
    ImageTags: { Primary: "p" },
    BackdropImageTags: ["b"],
  });
  assert.equal(jelly.director, "Ada Voss");
  assert.equal(jelly.cast[0], "Mina Cole");
  assert.match(jelly.posterPath, /^\/Items\/abc\/Images\/Primary/);
  assert.match(jelly.stillPath, /Backdrop/);
});
