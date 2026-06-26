import PhoneShell from "@/components/layout/PhoneShell";
import Dots from "@/components/ui/Dots";
import { GameSession } from "@/types/game";

export default function PartnerLobbyScreen({
  session,
}: {
  session: GameSession;
}) {
  return (
    <PhoneShell dark>
      <div className="brand">THE WALL JOB</div>

      <section className="role-card-dark">
        <div className="role-badge">🕵 CREW PARTNER</div>
        <small>PLAYER 2</small>
      </section>

      <section className="brief-dark">
        <h2>MISSION BRIEFING</h2>
        <ul>
          <li>Get the manager&apos;s smart key.</li>
          <li>Keep your trail clean.</li>
          <li>Activate it at the vault terminal.</li>
          <li>Release the vault code.</li>
          <li>Open the wall vault.</li>
        </ul>
      </section>

      <p className="waiting">
        {session.currentStep === "lobby"
          ? "Waiting for Crew Lead..."
          : "Mission loading..."}
      </p>

      <Dots active={4} />
    </PhoneShell>
  );
}