"use client";

import { useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { KEY_SIGNATURE, SUCCESS_MAX_TRAIL_MARKS } from "@/constants/gameData";
import { createFreshSession } from "@/services/sessionService";

type ChoiceRow = {
  gateNumber: number;
  choiceType: string;
  choiceSelected: string;
  trailMarkValue: number;
};

type BankAlertRow = {
  bankAlertNumber: number;
  leadMove: string;
  partnerMove: string;
  lockedMove: string;
  trailMarkValue: number;
};

type ConsoleSession = {
  sessionId?: string;
  crewCode: string;
  currentStep: string;
  player1Connected: boolean;
  player2Connected: boolean;
  totalTrailMarks: number;
  keySignature: string[];
  finalOutcome: "success" | "near_unlock" | null;
  terminalStatus?: string;
  choices?: ChoiceRow[];
  bankAlerts?: BankAlertRow[];
  gates?: Record<string, string | number>;
};

const BANK_ALERT_TEXT = {
  1: {
    leadMove: "Blend with crowd.",
    partnerMove: "Use chaos, advance.",
  },
  2: {
    leadMove: "Stall him, clear path.",
    partnerMove: "Beat him to the office.",
  },
  3: {
    leadMove: "Reset key tray.",
    partnerMove: "Pocket key, leave tray open.",
  },
} as const;

function buildChoicesFromGates(session: ConsoleSession): ChoiceRow[] {
  const gates = session.gates || {};

  return [1, 2, 3].flatMap((gateNumber) => [
    {
      gateNumber,
      choiceType: "lead_private",
      choiceSelected: String(gates[`g${gateNumber}_lead_choice`] || "-"),
      trailMarkValue: Number(gates[`g${gateNumber}_lead_choice_trail`] || 0),
    },
    {
      gateNumber,
      choiceType: "partner_private",
      choiceSelected: String(gates[`g${gateNumber}_partner_choice`] || "-"),
      trailMarkValue: Number(gates[`g${gateNumber}_partner_choice_trail`] || 0),
    },
  ]);
}

function buildBankAlertsFromGates(session: ConsoleSession): BankAlertRow[] {
  const gates = session.gates || {};

  return [1, 2, 3].map((bankAlertNumber) => {
    const text = BANK_ALERT_TEXT[bankAlertNumber as 1 | 2 | 3];

    return {
      bankAlertNumber,
      leadMove: text.leadMove,
      partnerMove: text.partnerMove,
      lockedMove: String(gates[`g${bankAlertNumber}_bank_lock`] || "-"),
      trailMarkValue: Number(gates[`g${bankAlertNumber}_bank_lock_trail`] || 0),
    };
  });
}

function getChoices(session: ConsoleSession): ChoiceRow[] {
  if (session.choices && session.choices.length > 0) return session.choices;
  return buildChoicesFromGates(session);
}

function getBankAlerts(session: ConsoleSession): BankAlertRow[] {
  if (session.bankAlerts && session.bankAlerts.length > 0) {
    return session.bankAlerts;
  }

  return buildBankAlertsFromGates(session);
}

function calculateTrailMarks(session: ConsoleSession) {
  const choicesTrail = getChoices(session).reduce(
    (sum, item) => sum + Number(item.trailMarkValue || 0),
    0
  );

  const bankTrail = getBankAlerts(session).reduce(
    (sum, item) => sum + Number(item.trailMarkValue || 0),
    0
  );

  return choicesTrail + bankTrail;
}

function normalizeSession(session: ConsoleSession): ConsoleSession {
  const choices = getChoices(session);
  const bankAlerts = getBankAlerts(session);

  return {
    ...session,
    choices,
    bankAlerts,
    totalTrailMarks:
      typeof session.totalTrailMarks === "number"
        ? session.totalTrailMarks
        : calculateTrailMarks(session),
    keySignature: session.keySignature?.length
      ? session.keySignature
      : KEY_SIGNATURE,
    terminalStatus: session.terminalStatus || "idle",
  };
}

export default function TestConsolePage() {
  const [crewCode, setCrewCode] = useState("");
  const [session, setSession] = useState<ConsoleSession | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanCode = crewCode.trim().toUpperCase();

  const visibleSession = useMemo(() => {
    return session ? normalizeSession(session) : null;
  }, [session]);

  async function loadResult() {
    if (!cleanCode) {
      setMessage("Enter crew code first.");
      return;
    }

    setLoading(true);

    try {
      const snap = await getDoc(doc(db, "sessions", cleanCode));

      if (!snap.exists()) {
        setSession(null);
        setMessage("No Firebase session found.");
      } else {
        const loaded = snap.data() as ConsoleSession;
        setSession(normalizeSession(loaded));
        setMessage("Session loaded.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load session.");
    }

    setLoading(false);
  }

  async function saveAndLoad(data: ConsoleSession, successMessage: string) {
    setLoading(true);

    try {
      const normalized = normalizeSession(data);

      await setDoc(doc(db, "sessions", normalized.crewCode), {
        ...normalized,
        updatedAt: serverTimestamp(),
      });

      const snap = await getDoc(doc(db, "sessions", normalized.crewCode));

      if (snap.exists()) {
        setSession(normalizeSession(snap.data() as ConsoleSession));
      }

      setMessage(successMessage);
    } catch (error) {
      console.error(error);
      setMessage("Firebase update failed.");
    }

    setLoading(false);
  }

  async function resetSession() {
    if (!cleanCode) {
      setMessage("Enter crew code first.");
      return;
    }

    const fresh = createFreshSession(cleanCode);

    const resetData: ConsoleSession = {
      ...fresh,
      sessionId: crypto.randomUUID(),
      crewCode: cleanCode,
      currentStep: "lobby",
      player1Connected: true,
      player2Connected: false,
      totalTrailMarks: 0,
      keySignature: KEY_SIGNATURE,
      finalOutcome: null,
      terminalStatus: "idle",
      choices: [],
      bankAlerts: [],
      gates: {},
    };

    await saveAndLoad(resetData, "Session reset successfully.");
  }

  async function resetTerminal() {
    if (!visibleSession) {
      setMessage("Load a session first.");
      return;
    }

    const updated: ConsoleSession = {
      ...visibleSession,
      terminalStatus: "idle",
    };

    await saveAndLoad(updated, "Terminal reset successfully.");
  }

  async function forceSuccess() {
    if (!cleanCode) {
      setMessage("Enter crew code first.");
      return;
    }

    const successData: ConsoleSession = {
      sessionId: crypto.randomUUID(),
      crewCode: cleanCode,
      currentStep: "complete",
      player1Connected: true,
      player2Connected: true,
      totalTrailMarks: 0,
      keySignature: KEY_SIGNATURE,
      finalOutcome: "success",
      terminalStatus: "success",
      choices: [
        { gateNumber: 1, choiceType: "lead_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 1, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 2, choiceType: "lead_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 2, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 3, choiceType: "lead_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 3, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
      ],
      bankAlerts: [
        { bankAlertNumber: 1, ...BANK_ALERT_TEXT[1], lockedMove: "my_move", trailMarkValue: 0 },
        { bankAlertNumber: 2, ...BANK_ALERT_TEXT[2], lockedMove: "my_move", trailMarkValue: 0 },
        { bankAlertNumber: 3, ...BANK_ALERT_TEXT[3], lockedMove: "my_move", trailMarkValue: 0 },
      ],
      gates: {
        g1_lead_choice: "a",
        g1_lead_choice_trail: 0,
        g1_partner_choice: "a",
        g1_partner_choice_trail: 0,
        g1_bank_lock: "my_move",
        g1_bank_lock_trail: 0,

        g2_lead_choice: "a",
        g2_lead_choice_trail: 0,
        g2_partner_choice: "a",
        g2_partner_choice_trail: 0,
        g2_bank_lock: "my_move",
        g2_bank_lock_trail: 0,

        g3_lead_choice: "a",
        g3_lead_choice_trail: 0,
        g3_partner_choice: "a",
        g3_partner_choice_trail: 0,
        g3_bank_lock: "my_move",
        g3_bank_lock_trail: 0,
      },
    };

    await saveAndLoad(successData, "Success forced with 0 trail marks.");
  }

  async function forceNearUnlock() {
    if (!cleanCode) {
      setMessage("Enter crew code first.");
      return;
    }

    const nearUnlockData: ConsoleSession = {
      sessionId: crypto.randomUUID(),
      crewCode: cleanCode,
      currentStep: "complete",
      player1Connected: true,
      player2Connected: true,
      totalTrailMarks: SUCCESS_MAX_TRAIL_MARKS + 2,
      keySignature: KEY_SIGNATURE,
      finalOutcome: "near_unlock",
      terminalStatus: "near_unlock",
      choices: [
        { gateNumber: 1, choiceType: "lead_private", choiceSelected: "b", trailMarkValue: 1 },
        { gateNumber: 1, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 2, choiceType: "lead_private", choiceSelected: "b", trailMarkValue: 1 },
        { gateNumber: 2, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
        { gateNumber: 3, choiceType: "lead_private", choiceSelected: "b", trailMarkValue: 1 },
        { gateNumber: 3, choiceType: "partner_private", choiceSelected: "a", trailMarkValue: 0 },
      ],
      bankAlerts: [
        { bankAlertNumber: 1, ...BANK_ALERT_TEXT[1], lockedMove: "partner_move", trailMarkValue: 1 },
        { bankAlertNumber: 2, ...BANK_ALERT_TEXT[2], lockedMove: "my_move", trailMarkValue: 0 },
        { bankAlertNumber: 3, ...BANK_ALERT_TEXT[3], lockedMove: "partner_move", trailMarkValue: 0 },
      ],
      gates: {
        g1_lead_choice: "b",
        g1_lead_choice_trail: 1,
        g1_partner_choice: "a",
        g1_partner_choice_trail: 0,
        g1_bank_lock: "partner_move",
        g1_bank_lock_trail: 1,

        g2_lead_choice: "b",
        g2_lead_choice_trail: 1,
        g2_partner_choice: "a",
        g2_partner_choice_trail: 0,
        g2_bank_lock: "my_move",
        g2_bank_lock_trail: 0,

        g3_lead_choice: "b",
        g3_lead_choice_trail: 1,
        g3_partner_choice: "a",
        g3_partner_choice_trail: 0,
        g3_bank_lock: "partner_move",
        g3_bank_lock_trail: 0,
      },
    };

    await saveAndLoad(
      nearUnlockData,
      `Near Unlock forced with ${SUCCESS_MAX_TRAIL_MARKS + 2} trail marks.`
    );
  }

  async function clearAllTestData() {
    const ok = confirm("Delete all sessions from Firebase?");
    if (!ok) return;

    setLoading(true);

    try {
      const snap = await getDocs(collection(db, "sessions"));

      await Promise.all(
        snap.docs.map((item) => deleteDoc(doc(db, "sessions", item.id)))
      );

      setCrewCode("");
      setSession(null);
      setMessage("All sessions cleared.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to clear sessions.");
    }

    setLoading(false);
  }

  return (
    <main className="test-console-light">
      <section className="console-panel">
        <h1>Test Console</h1>
        <p>Private testing page for crew sessions.</p>

        <div className="console-form">
          <input
            value={crewCode}
            onChange={(e) => setCrewCode(e.target.value.toUpperCase())}
            placeholder="Enter crew code"
          />

          <button onClick={loadResult} disabled={loading}>
            Load
          </button>
        </div>

        <div className="console-actions">
          <button onClick={forceSuccess} disabled={loading}>
            Force Success
          </button>

          <button onClick={forceNearUnlock} disabled={loading}>
            Force Near Unlock
          </button>

          <button onClick={resetSession} disabled={loading}>
            Reset Session
          </button>

          <button onClick={resetTerminal} disabled={loading}>
            Reset Terminal
          </button>

          <button onClick={clearAllTestData} disabled={loading}>
            Clear All
          </button>
        </div>

        {message && <div className="console-message-light">{message}</div>}
      </section>

      {visibleSession && (
        <section className="console-result-light">
          <div className="result-header">
            <div>
              <h2>Firebase Session</h2>
              <p>{visibleSession.crewCode}</p>
            </div>

            <span
              className={
                visibleSession.finalOutcome === "success"
                  ? "badge success"
                  : visibleSession.finalOutcome === "near_unlock"
                  ? "badge warning"
                  : "badge neutral"
              }
            >
              {visibleSession.finalOutcome || "not finished"}
            </span>
          </div>

          <div className="summary-grid">
            <div>
              <span>Current Step</span>
              <b>{visibleSession.currentStep}</b>
            </div>

            <div>
              <span>Trail Marks</span>
              <b>{visibleSession.totalTrailMarks}</b>
            </div>

            <div>
              <span>Key Signature</span>
              <b>{visibleSession.keySignature?.join(" ")}</b>
            </div>

            <div>
              <span>Terminal</span>
              <b>{visibleSession.terminalStatus || "idle"}</b>
            </div>

            <div>
              <span>Player 1</span>
              <b>{visibleSession.player1Connected ? "Connected" : "Waiting"}</b>
            </div>

            <div>
              <span>Player 2</span>
              <b>{visibleSession.player2Connected ? "Connected" : "Waiting"}</b>
            </div>
          </div>

          <h3>Choices</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Gate</th>
                  <th>Type</th>
                  <th>Choice</th>
                  <th>Trail</th>
                </tr>
              </thead>

              <tbody>
                {visibleSession.choices?.map((choice, index) => (
                  <tr key={index}>
                    <td>{choice.gateNumber}</td>
                    <td>{choice.choiceType}</td>
                    <td>{choice.choiceSelected}</td>
                    <td>{choice.trailMarkValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Bank Alerts</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alert</th>
                  <th>Lead Move</th>
                  <th>Partner Move</th>
                  <th>Locked</th>
                  <th>Trail</th>
                </tr>
              </thead>

              <tbody>
                {visibleSession.bankAlerts?.map((alert) => (
                  <tr key={alert.bankAlertNumber}>
                    <td>{alert.bankAlertNumber}</td>
                    <td>{alert.leadMove}</td>
                    <td>{alert.partnerMove}</td>
                    <td>{alert.lockedMove}</td>
                    <td>{alert.trailMarkValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Raw Firebase Data</h3>
          <pre>{JSON.stringify(visibleSession, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}