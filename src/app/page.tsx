"use client";

import { useEffect, useState } from "react";
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
  const [creating, setCreating] = useState(false);

  const { session } = useFirebaseSession(crewCode);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      setCrewCode(code.toUpperCase());
      setView("join");
    }
  }, []);

  async function createCrew() {
    if (creating) return;

    try {
      setCreating(true);

      const code = generateCode();

      await createSession(code);

      setCrewCode(code);
      setRole("lead");
      setView("game");
    } catch (error) {
      console.error(error);
      alert("Unable to create crew.");
    } finally {
      setCreating(false);
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
        creating={creating}
      />
    );
  }

  if (view === "join") {
    return (
      <JoinScreen
        onJoin={joinCrew}
        onBack={() => setView("entry")}
        defaultCode={crewCode}
      />
    );
  }

  if (!session || !role) {
    return <main className="loader">Loading session...</main>;
  }

  return <GameRouter role={role} session={session} />;
}