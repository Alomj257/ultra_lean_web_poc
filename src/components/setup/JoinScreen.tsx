"use client";

import { useState } from "react";
import PhoneShell from "@/components/layout/PhoneShell";
import Button from "@/components/ui/Button";
import Dots from "@/components/ui/Dots";

export default function JoinScreen({
  onJoin,
  onBack,
}: {
  onJoin: (code: string) => Promise<void>;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    try {
      const clean = code.trim().toUpperCase();

      if (!clean) {
        setError("Enter crew code.");
        return;
      }

      await onJoin(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join.");
    }
  }

  return (
    <PhoneShell dark>
      <div className="brand">THE WALL JOB</div>

      <section className="setup-card scan-screen">
        <h1>SCAN CREW CODE</h1>

        <p>
          Point your camera
          <br />
          at your partner&apos;s code.
        </p>

        <div className="scan-box" />

        <input
          className="crew-input"
          placeholder="CREW CODE"
          value={code}
          onChange={(e) => {
            setError("");
            setCode(e.target.value.toUpperCase());
          }}
        />

        {error && <p className="error">{error}</p>}
      </section>

      <Button variant="gold" onClick={submit}>
        JOIN MISSION
      </Button>

      <Button variant="ghost" onClick={onBack}>
        BACK
      </Button>

      <Dots active={2} />
    </PhoneShell>
  );
}