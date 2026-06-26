"use client";

import { useCallback, useEffect } from "react";
import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import TimerPill from "@/components/ui/TimerPill";
import WaitingScreen from "@/components/game/WaitingScreen";
import { GATES, PRIVATE_MOVE_TIMEOUT } from "@/constants/gameData";
import { GameSession, GameStep, Role } from "@/types/game";
import { lockChoice, updateSession } from "@/services/sessionService";

export default function PrivateMoveScreen({
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
  const move = isLead ? gate.leadMove : gate.partnerMove;

  const playerName = isLead ? "Crew Lead" : "Crew Partner";
  const choiceKey = `g${gate.id}_${isLead ? "lead" : "partner"}_choice`;
  const alreadyChosen = session.gates?.[choiceKey];

  const choose = useCallback(
    async (choice: string) => {
      if (session.gates?.[choiceKey]) return;

      const trail = choice === move.goodChoice ? 0 : 1;

      await lockChoice(session.crewCode, choiceKey, choice, trail);
    },
    [choiceKey, move.goodChoice, session]
  );

  useEffect(() => {
    const leadDone = session.gates?.[`g${gate.id}_lead_choice`];
    const partnerDone = session.gates?.[`g${gate.id}_partner_choice`];

    if (
      leadDone &&
      partnerDone &&
      session.currentStep === `gate_${gate.id}_private`
    ) {
      updateSession(session.crewCode, {
        currentStep: `gate_${gate.id}_bank_alert` as GameStep,
      });
    }
  }, [gate.id, session]);

  if (alreadyChosen) return <WaitingScreen role={playerName} />;

  return (
    <PhoneShell>
      <TopBar
        title={playerName}
        timer={
          <TimerPill
            seconds={PRIVATE_MOVE_TIMEOUT}
            onExpire={() => choose("timeout")}
          />
        }
      />

      <section className="private-copy">
        <p>{move.prompt}</p>
      </section>

      <div className="choices-bottom">
        <Button variant="choice" onClick={() => choose("a")}>
          A) {move.a}
        </Button>

        <Button variant="choice" onClick={() => choose("b")}>
          B) {move.b}
        </Button>
      </div>
    </PhoneShell>
  );
}