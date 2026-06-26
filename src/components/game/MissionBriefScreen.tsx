"use client";

import PhoneShell from "@/components/layout/PhoneShell";
import Button from "@/components/ui/Button";
import Dots from "@/components/ui/Dots";
import { Role } from "@/types/game";

export default function MissionBriefScreen({
  role,
  onBegin,
}: {
  role: Role;
  onBegin: () => void;
}) {
  const isLead = role === "lead";

  return (
    <PhoneShell dark>
      <div className="brand">THE WALL JOB</div>

      <section className="role-card-dark">
        <div className="role-badge">
          🕵 {isLead ? "CREW LEAD" : "CREW PARTNER"}
        </div>
        <small>{isLead ? "PLAYER 1" : "PLAYER 2"}</small>
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

      {isLead ? (
        <Button variant="gold" onClick={onBegin}>
          BEGIN
        </Button>
      ) : (
        <p className="waiting">Waiting for Crew Lead to begin...</p>
      )}

      <Dots active={4} />
    </PhoneShell>
  );
}