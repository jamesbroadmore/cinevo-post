import { createFileRoute } from "@tanstack/react-router";
import { PublicFrame } from "@/components/cinevo/public-frame";

export const Route = createFileRoute("/legal/terms")({ component: Terms });

function Terms() {
  return (
    <PublicFrame
      kicker="TERMS"
      title="Use the house you control."
      lede="CINEVO plays media you already have the right to watch. It does not grant a license to anything else."
    >
      <section>
        <h2>Your libraries</h2>
        <p>Connect only folders, Plex servers, and Jellyfin servers you are allowed to use. You are responsible for the titles you import and for the people you invite.</p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>A share is a catalog invitation. Playback stays on the original server. Do not use a share to redistribute files you do not have the right to offer.</p>
      </section>
      <section>
        <h2>The service</h2>
        <p>CINEVO can change, pause, or remove a feature. Local folder playback depends on this browser. Node playback depends on the computer you pair. We do not promise that every file will play.</p>
      </section>
      <section>
        <h2>Accounts</h2>
        <p>Keep your sign-in private. You can stop using CINEVO at any time and clear the data stored in this browser from Settings.</p>
      </section>
    </PublicFrame>
  );
}
