import { createFileRoute } from "@tanstack/react-router";
import { iosLoopback, profileHouseUrl, renderIosProfile } from "@/lib/ios-profile";

export const Route = createFileRoute("/api/ios-profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const house = profileHouseUrl(
          request.url,
          request.headers.get("x-forwarded-host"),
          request.headers.get("x-forwarded-proto"),
        );
        if (!house) return new Response("CINEVO could not build an iPhone profile for this address.", { status: 400 });
        if (iosLoopback(house)) {
          return new Response(
            "<!doctype html><meta name=viewport content=\"width=device-width,initial-scale=1\"><title>CINEVO</title><body style=\"font-family:system-ui;background:#050505;color:#fff;padding:2rem\"><h1>Open CINEVO from this iPhone’s network</h1><p>This address is only on this computer. On the house, use the computer’s network address, then download the profile again.</p></body>",
            { status: 409, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
          );
        }
        return new Response(renderIosProfile(house), {
          headers: {
            "content-type": "application/x-apple-aspen-config",
            "content-disposition": 'attachment; filename="CINEVO.mobileconfig"',
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});