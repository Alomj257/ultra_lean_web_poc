"use client";

import LeadLobbyScreen from "@/components/setup/LeadLobbyScreen";
import PartnerLobbyScreen from "@/components/setup/PartnerLobbyScreen";
import MissionBriefScreen from "@/components/game/MissionBriefScreen";
import PrivateMoveScreen from "@/components/game/PrivateMoveScreen";
import BankAlertScreen from "@/components/game/BankAlertScreen";
import GateResultScreen from "@/components/game/GateResultScreen";
import CompleteScreen from "@/components/game/CompleteScreen";
import { GameSession, Role } from "@/types/game";
import { updateSession } from "@/services/sessionService";
import { GATES } from "@/constants/gameData";

export default function GameRouter({
  role,
  session,
}: {
  role: Role;
  session: GameSession;
}) {
  const step = session.currentStep;

  if (role === "lead" && step === "lobby") {
    return (
      <LeadLobbyScreen
        session={session}
        onStart={() =>
          updateSession(session.crewCode, { currentStep: "mission_brief" })
        }
      />
    );
  }

  if (role === "partner" && step === "lobby") {
    return <PartnerLobbyScreen session={session} />;
  }

  if (step === "mission_brief") {
    return (
      <MissionBriefScreen
        role={role}
        onBegin={() =>
          updateSession(session.crewCode, { currentStep: "gate_1_private" })
        }
      />
    );
  }

  if (step === "complete") {
    return <CompleteScreen session={session} />;
  }

  for (let i = 0; i < GATES.length; i++) {
    const gate = GATES[i];

    if (step === `gate_${gate.id}_private`) {
      return <PrivateMoveScreen role={role} gateIndex={i} session={session} />;
    }

    if (step === `gate_${gate.id}_bank_alert`) {
      return <BankAlertScreen role={role} gateIndex={i} session={session} />;
    }

    if (step === `gate_${gate.id}_result`) {
      return <GateResultScreen role={role} gateIndex={i} session={session} />;
    }
  }

  return <main className="loader">Unknown step</main>;
}