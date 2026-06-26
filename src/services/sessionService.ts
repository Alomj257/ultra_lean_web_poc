import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { KEY_SIGNATURE } from "@/constants/gameData";
import { GameSession, GameStep, FinalOutcome } from "@/types/game";

export function generateCode() {
  return `${Math.random().toString(36).slice(2, 6)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`.toUpperCase();
}

export function createFreshSession(code: string): GameSession {
  return {
    crewCode: code,
    player1Connected: true,
    player2Connected: false,
    currentStep: "lobby",
    totalTrailMarks: 0,
    keySignature: KEY_SIGNATURE,
    finalOutcome: null,
    gates: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function createSession(code: string) {
  const ref = doc(db, "sessions", code);
  const fresh = createFreshSession(code);
  await setDoc(ref, fresh);
  return fresh;
}

export async function getSession(code: string) {
  const ref = doc(db, "sessions", code);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as GameSession) : null;
}

export async function joinSession(code: string) {
  const ref = doc(db, "sessions", code);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists()) throw new Error("Crew not found");

    const data = snap.data() as GameSession;

    if (data.player2Connected) throw new Error("Crew already full");

    tx.update(ref, {
      player2Connected: true,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function updateSession(
  code: string,
  data: Partial<GameSession>
) {
  const ref = doc(db, "sessions", code);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function lockChoice(
  code: string,
  choiceKey: string,
  choice: string,
  trail: number
) {
  const ref = doc(db, "sessions", code);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;

    const data = snap.data() as GameSession;

    if (data.gates?.[choiceKey]) return;

    tx.update(ref, {
      [`gates.${choiceKey}`]: choice,
      [`gates.${choiceKey}_trail`]: trail,
      totalTrailMarks: (data.totalTrailMarks || 0) + trail,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function lockBankMove(
  code: string,
  lockKey: string,
  choice: string,
  trail: number,
  nextStep: GameStep
) {
  const ref = doc(db, "sessions", code);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;

    const data = snap.data() as GameSession;

    if (data.gates?.[lockKey]) return;

    tx.update(ref, {
      [`gates.${lockKey}`]: choice,
      [`gates.${lockKey}_trail`]: trail,
      totalTrailMarks: (data.totalTrailMarks || 0) + trail,
      currentStep: nextStep,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function finishGame(
  code: string,
  finalOutcome: FinalOutcome
) {
  await updateSession(code, {
    currentStep: "complete",
    finalOutcome,
  });
}

export function listenSession(
  code: string,
  callback: (session: GameSession | null) => void
) {
  const ref = doc(db, "sessions", code);

  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as GameSession) : null);
  });
}