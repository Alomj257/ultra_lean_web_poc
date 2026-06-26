"use client";

import { useState } from "react";
import EntryScreen from "@/components/setup/EntryScreen";
import JoinScreen from "@/components/setup/JoinScreen";
import GameRouter from "@/components/game/GameRouter";
import { createSession, generateCode, joinSession } from "@/services/sessionService";
import { useFirebaseSession } from "@/hooks/useFirebaseSession";
import { Role } from "@/types/game";

type View = "entry" | "join" | "game";

export default function HomePage() {
  const [view, setView] = useState<View>("entry");
  const [crewCode, setCrewCode] = useState("");
  const [role, setRole] = useState<Role | null>(null);

  const { session } = useFirebaseSession(crewCode);

  async function createCrew() {
  try {
    const code = generateCode();

    console.log("Creating crew:", code);

    await createSession(code);

    setCrewCode(code);
    setRole("lead");
    setView("game");
  } catch (error) {
    console.error("Create crew error:", error);
    alert(error instanceof Error ? error.message : "Firebase error");
  }
}

  async function joinCrew(code: string) {
    await joinSession(code);

    setCrewCode(code);
    setRole("partner");
    setView("game");
  }

  if (view === "entry") {
    return (
      <EntryScreen
        onCreateCrew={createCrew}
        onJoinCrew={() => setView("join")}
      />
    );
  }

  if (view === "join") {
    return (
      <JoinScreen
        onJoin={joinCrew}
        onBack={() => setView("entry")}
      />
    );
  }

  if (!session || !role) {
    return <main className="loader">Loading session...</main>;
  }

  return <GameRouter role={role} session={session} />;
}