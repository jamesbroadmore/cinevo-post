import assert from "node:assert/strict";
import test from "node:test";
import { headersForOAuth, resolveOAuthPublicOrigin } from "./oauth-origin.ts";

test("sandbox proxy may point OAuth back at the preview", () => {
  const headers = new Headers({ host: "127.0.0.1:8080" });
  const origin = resolveOAuthPublicOrigin(headers, "https://house.grok-sandbox.com");
  assert.equal(origin?.origin, "https://house.grok-sandbox.com");
  const next = headersForOAuth(headers, "https://house.grok-sandbox.com");
  assert.equal(next.get("x-forwarded-host"), "house.grok-sandbox.com");
  assert.equal(next.get("x-forwarded-proto"), "https");
});

test("a real public host is not replaced", () => {
  const headers = new Headers({ "x-forwarded-host": "house.grok-sandbox.com", "x-forwarded-proto": "https" });
  assert.equal(resolveOAuthPublicOrigin(headers, "https://evil.grok-sandbox.com"), null);
});

test("rejects origins the broker would not call back", () => {
  const headers = new Headers({ host: "127.0.0.1:8080" });
  assert.equal(resolveOAuthPublicOrigin(headers, "https://evil.example"), null);
  assert.equal(resolveOAuthPublicOrigin(headers, "http://127.0.0.1:32400"), null);
  assert.equal(resolveOAuthPublicOrigin(headers, "https://127.0.0.1:8080"), null);
});
