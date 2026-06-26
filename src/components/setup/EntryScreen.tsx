"use client";

import Button from "@/components/ui/Button";
import Dots from "@/components/ui/Dots";
import PhoneShell from "@/components/layout/PhoneShell";

export default function EntryScreen({
  onCreateCrew,
  onJoinCrew,
}: {
  onCreateCrew: () => void;
  onJoinCrew: () => void;
}) {
  return (
    <PhoneShell dark>
      <div className="brand">THE WALL JOB</div>

      <section className="setup-card hero-screen">
        <h1>
          2-PLAYER
          <br />
          CREW REQUIRED
        </h1>
        <div className="mini-line" />
        <p>
          No solo runs.
          <br />
          Assemble your crew.
        </p>
      </section>

      <div className="setup-actions">
        <Button variant="gold" onClick={onCreateCrew}>
          CREATE CREW
        </Button>
        <Button variant="teal" onClick={onJoinCrew}>
          JOIN CREW
        </Button>
      </div>

      <Dots active={0} />
    </PhoneShell>
  );
}