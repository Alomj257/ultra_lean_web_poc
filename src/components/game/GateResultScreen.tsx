"use client";

import PhoneShell from "@/components/layout/PhoneShell";
import Button from "@/components/ui/Button";
import { GATES, KEY_SIGNATURE, SUCCESS_MAX_TRAIL_MARKS } from "@/constants/gameData";
import { finishGame, updateSession } from "@/services/sessionService";
import { GameSession, GameStep, Role } from "@/types/game";

export default function GateResultScreen({
  role,
  gateIndex,
  session,
}: {
  role: Role;
  gateIndex: number;
  session: GameSession;
}) {
  const gate = GATES[gateIndex];
  const isLead = role === "lead";
  const isLast = gate.id === 3;

  async function next() {
    if (isLast) {
      const finalOutcome =
        session.totalTrailMarks <= SUCCESS_MAX_TRAIL_MARKS
          ? "success"
          : "near_unlock";

      await finishGame(session.crewCode, finalOutcome);
    } else {
      await updateSession(session.crewCode, {
        currentStep: `gate_${gate.id + 1}_private` as GameStep,
      });
    }
  }

  return (
    <PhoneShell>
      <section className="result-box">
        <div className="checkmark">✓</div>

        <h2>{gate.result.title}</h2>

        <hr />

        <h3>{gate.result.main}</h3>

        {gate.result.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}

        {gate.result.note && (
          <>
            <hr />
            <p className="note">Trail note: {gate.result.note}</p>
          </>
        )}

        {"showKeySignature" in gate.result && gate.result.showKeySignature && (
          <>
            <hr />
            <div className="key-row">
              <span>Key Signature</span>
              <b>{KEY_SIGNATURE.join(" ")}</b>
            </div>
            <p className="note">Use this at the Vault Terminal.</p>
          </>
        )}
      </section>

      {isLead ? (
        <Button
          variant={isLast ? "purple" : gate.id === 2 ? "tealSolid" : "black"}
          onClick={next}
        >
          {isLast ? "Go to Vault Terminal" : "Next Gate"}
        </Button>
      ) : (
        <p className="plain-wait">Waiting for Crew Lead...</p>
      )}
    </PhoneShell>
  );
}