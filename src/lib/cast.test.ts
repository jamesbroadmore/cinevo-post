import assert from "node:assert/strict";
import test from "node:test";
import { castBlock } from "./cast.ts";

const page = "http://192.168.1.20:8080/app";

test("cast allows a proxied stream on a LAN address", () => {
  assert.equal(castBlock("/api/stream/ticket", page), null);
  assert.equal(castBlock("https://house.example/api/stream/ticket", page), null);
});

test("cast refuses files that only exist in this browser", () => {
  assert.equal(castBlock(undefined, page), "local");
  assert.equal(castBlock("blob:http://192.168.1.20/id", page), "local");
});

test("cast refuses loopback because a TV cannot open it", () => {
  assert.equal(castBlock("/api/stream/ticket", "http://localhost:8080/app"), "loopback");
  assert.equal(castBlock("/api/stream/ticket", "http://127.0.0.1:8080/app"), "loopback");
  assert.equal(castBlock("http://127.0.0.1:3000/v1/play", page), "loopback");
});
