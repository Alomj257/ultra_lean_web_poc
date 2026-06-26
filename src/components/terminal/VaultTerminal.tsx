"use client";

import { useEffect, useMemo, useState } from "react";
import TabletShell from "@/components/layout/TabletShell";
import Button from "@/components/ui/Button";
import FakeQR from "@/components/terminal/FakeQR";
import {
  KEY_SIGNATURE,
  SUCCESS_MAX_TRAIL_MARKS,
  VAULT_CODE,
  VAULT_CODE_DISPLAY,
} from "@/constants/gameData";
import { getSession } from "@/services/sessionService";
import { GameSession } from "@/types/game";

type Screen = "idle" | "key" | "suspense" | "result";
type Outcome = "success" | "near_unlock" | null;

export default function VaultTerminal() {
  const [screen, setScreen] = useState<Screen>("idle");
  const [sessionCode, setSessionCode] = useState("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [input, setInput] = useState(["", "", ""]);
  const [sequence, setSequence] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [codeTimer, setCodeTimer] = useState(VAULT_CODE_DISPLAY);
  const [error, setError] = useState("");

  const keyMatched = useMemo(() => {
    return input.join("") === KEY_SIGNATURE.join("");
  }, [input]);

  async function beginActivation() {
    const clean = sessionCode.trim().toUpperCase();

    if (!clean) {
      setError("Enter crew code.");
      return;
    }

    const found = await getSession(clean);

    if (!found) {
      setError("Crew not found.");
      return;
    }

    setSession(found);
    setError("");
    setScreen("key");
  }

  function activate() {
    if (!keyMatched) {
      setError("Key signature not recognized.");
      return;
    }

    const marks = session?.totalTrailMarks || 0;

    const finalOutcome =
      marks <= SUCCESS_MAX_TRAIL_MARKS ? "success" : "near_unlock";

    setOutcome(finalOutcome);

    if (finalOutcome === "success") {
      setSequence([
        "Smart key recognized.",
        "Checking trail...",
        "Bolt 1 released.",
        "Bolt 2 released.",
        "Final bolt released.",
        "Vault code released.",
      ]);
    } else {
      setSequence([
        "Smart key recognized.",
        "Checking trail...",
        "Bolt 1 released.",
        "Office trace found.",
        "Bolt 2 released.",
        "Time-lock engaged.",
        "Vault code sealed.",
      ]);
    }

    setIndex(0);
    setScreen("suspense");
  }

  useEffect(() => {
    if (screen !== "suspense") return;

    if (index >= sequence.length) {
      const id = setTimeout(() => setScreen("result"), 600);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, 1500);

    return () => clearTimeout(id);
  }, [screen, index, sequence.length]);

  useEffect(() => {
    if (screen !== "result" || outcome !== "success") return;

    const id = setInterval(() => {
      setCodeTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [screen, outcome]);

  function reset() {
    setScreen("idle");
    setSessionCode("");
    setSession(null);
    setInput(["", "", ""]);
    setSequence([]);
    setIndex(0);
    setOutcome(null);
    setCodeTimer(VAULT_CODE_DISPLAY);
    setError("");
  }

  if (screen === "idle") {
    return (
      <TabletShell>
        <h1>Vault Terminal</h1>
        <p>Activate smart key.</p>

        <input
          className="tablet-input"
          placeholder="CREW CODE"
          value={sessionCode}
          onChange={(e) => {
            setError("");
            setSessionCode(e.target.value.toUpperCase());
          }}
        />

        {error && <p className="error">{error}</p>}

        <Button variant="black tablet-btn" onClick={beginActivation}>
          Begin Activation
        </Button>
      </TabletShell>
    );
  }

  if (screen === "key") {
    return (
      <TabletShell>
        <h1>Enter Key Signature</h1>

        <div className="symbol-row">
          {KEY_SIGNATURE.map((symbol, i) => (
            <button
              key={symbol}
              className={input[i] ? "picked" : ""}
              onClick={() => {
                const next = [...input];
                next[i] = next[i] ? "" : symbol;
                setInput(next);
                setError("");
              }}
              type="button"
            >
              [ {symbol} ]
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <Button variant="black tablet-btn" onClick={activate}>
          Activate Key
        </Button>
      </TabletShell>
    );
  }

  if (screen === "suspense") {
    return (
      <TabletShell>
        <h1>Vault Terminal</h1>

        <div className="terminal-lines">
          {sequence.slice(0, index).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </TabletShell>
    );
  }

  if (outcome === "success") {
    return (
      <TabletShell>
        <h1>Crew Status</h1>
        <p>Vault Opened</p>

        <div className="code-card">
          <span>Vault Code</span>
          <b>{VAULT_CODE}</b>
        </div>

        <p>Enter code on wall vault.</p>
        <p>Code expires in {codeTimer} seconds.</p>

        <Button variant="outline tablet-btn" onClick={reset}>
          Reset Terminal
        </Button>
      </TabletShell>
    );
  }

  return (
    <TabletShell>
      <h1>Time-Lock Engaged</h1>
      <p>Crew Status</p>
      <h2>Near Unlock</h2>
      <p>Close call.</p>
      <p>Reward unlocked.</p>

      <FakeQR small />

      <p>Scan to claim reward</p>

      <Button variant="outline tablet-btn" onClick={reset}>
        Reset Terminal
      </Button>
    </TabletShell>
  );
}