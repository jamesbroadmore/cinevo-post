import assert from "node:assert/strict";
import test from "node:test";
import { iosLoopback, profileHouseUrl, renderIosProfile } from "./ios-profile.ts";

test("the iOS icon opens this house's player", () => {
  assert.equal(profileHouseUrl("https://house.example/app"), "https://house.example/app");
  assert.equal(
    profileHouseUrl("http://127.0.0.1:8080/app", "192.168.1.20:8080", "http"),
    "http://192.168.1.20:8080/app",
  );
  assert.equal(profileHouseUrl("file:///tmp/x"), null);
});

test("the profile is a CINEVO player, not a generic shortcut", () => {
  const xml = renderIosProfile("https://house.example/app");
  assert.match(xml, /<string>CINEVO<\/string>/);
  assert.match(xml, /com\.apple\.webClip\.managed/);
  assert.match(xml, /https:\/\/house\.example\/app/);
  assert.match(xml, /FullScreen/);
  assert.equal(iosLoopback("http://localhost:8080/app"), true);
  assert.equal(iosLoopback("https://house.example/app"), false);
});
