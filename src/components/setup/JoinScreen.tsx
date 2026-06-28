"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import PhoneShell from "@/components/layout/PhoneShell";
import Button from "@/components/ui/Button";
import Dots from "@/components/ui/Dots";

export default function JoinScreen({
  onJoin,
  onBack,
  defaultCode = "",
}: {
  onJoin: (code: string) => Promise<void>;
  onBack: () => void;
  defaultCode?: string;
}) {
  const [code, setCode] = useState(defaultCode);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function submit(joinCode?: string) {
    try {
      const clean = (joinCode || code).trim().toUpperCase();

      if (!clean) {
        setError("Enter or scan crew code.");
        return;
      }

      setJoining(true);
      await onJoin(clean);
    } catch (err) {
      setJoining(false);
      setError(err instanceof Error ? err.message : "Unable to join.");
    }
  }

  function handleScan(result: any) {
    if (!result || joining) return;

    const rawText = result[0]?.rawValue || "";
    if (!rawText) return;

    let scannedCode = rawText;

    try {
      const url = new URL(rawText);
      scannedCode = url.searchParams.get("code") || rawText;
    } catch {
      scannedCode = rawText;
    }

    scannedCode = scannedCode.trim().toUpperCase();

    setCode(scannedCode);
    submit(scannedCode);
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

        <div className="camera-box">
          <Scanner
            onScan={handleScan}
            onError={() => {
              setError("Camera permission denied or not available.");
            }}
            constraints={{
              facingMode: "environment",
            }}
          />
        </div>

        <input
          className="crew-input"
          placeholder="ENTER CREW CODE"
          value={code}
          onChange={(e) => {
            setError("");
            setCode(e.target.value.toUpperCase());
          }}
        />

        {error && <p className="error">{error}</p>}
      </section>

      <Button variant="gold" onClick={() => submit()} disabled={joining}>
        {joining ? "JOINING..." : "JOIN MISSION"}
      </Button>

      <Button variant="ghost" onClick={onBack}>
        BACK
      </Button>

      <Dots active={2} />
    </PhoneShell>
  );
}