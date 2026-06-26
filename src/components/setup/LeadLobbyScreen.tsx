"use client";

import PhoneShell from "@/components/layout/PhoneShell";
import Button from "@/components/ui/Button";
import Dots from "@/components/ui/Dots";
import FakeQR from "@/components/terminal/FakeQR";
import { GameSession } from "@/types/game";

export default function LeadLobbyScreen({
  session,
  onStart,
}: {
  session: GameSession;
  onStart: () => void;
}) {
  return (
    <PhoneShell dark>
      <div className="brand">THE WALL JOB</div>

      <section className="setup-card ticket-screen">
        <h1>
          LET YOUR
          <br />
          PARTNER JOIN
        </h1>

        <p>
          Share this crew code
          <br />
          to bring them in.
        </p>

        <FakeQR />

        <small>CREW CODE</small>
        <b>{session.crewCode}</b>
      </section>

      {session.player2Connected ? (
        <>
          <div className="connected-box">CREW PARTNER CONNECTED</div>
          <Button variant="gold" onClick={onStart}>
            START MISSION
          </Button>
        </>
      ) : (
        <p className="waiting">Waiting for partner to join...</p>
      )}

      <Dots active={1} />
    </PhoneShell>
  );
}