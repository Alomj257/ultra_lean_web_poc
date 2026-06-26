"use client";

import { useEffect, useState } from "react";
import { GameSession } from "@/types/game";
import { listenSession, updateSession } from "@/services/sessionService";

export function useFirebaseSession(crewCode: string) {
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    if (!crewCode) return;

    const unsubscribe = listenSession(crewCode, setSession);

    return () => unsubscribe();
  }, [crewCode]);

  const update = async (data: Partial<GameSession>) => {
    if (!crewCode) return;
    await updateSession(crewCode, data);
  };

  return { session, update };
}