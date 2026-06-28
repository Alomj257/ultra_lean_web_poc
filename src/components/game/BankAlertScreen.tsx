"use client";

import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import TimerPill from "@/components/ui/TimerPill";
import { BANK_ALERT_TIMEOUT, GATES } from "@/constants/gameData";
import { GameSession, GameStep, Role } from "@/types/game";
import { lockBankMove } from "@/services/sessionService";

export default function BankAlertScreen({
  role,
  gateIndex,
  session,
}: {
  role: Role;
  gateIndex: number;
  session: GameSession;
}) {
  const gate = GATES[gateIndex];
  const alert = gate.bankAlert;
  const isLead = role === "lead";

  const lockKey = `g${gate.id}_bank_lock`;
  const alreadyLocked = session.gates?.[lockKey];

  async function lockMove(choice: string) {
    if (alreadyLocked) return;

    const trail = choice === alert.goodChoice ? 0 : 1;

    await lockBankMove(
      session.crewCode,
      lockKey,
      choice,
      trail,
      `gate_${gate.id}_result` as GameStep
    );
  }

  return (
    <PhoneShell>
      <TopBar
        title={alert.label}
        timer={
          !alreadyLocked ? (
            <TimerPill
              seconds={BANK_ALERT_TIMEOUT}
              onExpire={
                isLead
                  ? () => lockMove("timeout")
                  : undefined
              }
            />
          ) : null
        }
      />

      <section className="bank-scenario">
        <h2>{alert.label}</h2>
        <p>{alert.scenario}</p>
      </section>

      <section className="bank-move">
        <span>Your Move:</span>

        <h3>{isLead ? alert.leadOption : alert.partnerOption}</h3>

        {isLead ? (
          <>
            <p>
              Your partner has another move.
              <br />
              Ask before you lock.
            </p>

            {!alreadyLocked ? (
              <div className="lock-panel">
                <b>Lock Crew Move</b>

                <div className="lock-grid">
                  <Button variant="black" onClick={() => lockMove("my_move")}>
                    My Move
                  </Button>

                  <Button
                    variant="choice small"
                    onClick={() => lockMove("partner_move")}
                  >
                    Partner&apos;s Move
                  </Button>
                </div>
              </div>
            ) : (
              <p>Crew move locked. Waiting for next scene...</p>
            )}
          </>
        ) : (
          <p>
            {alreadyLocked
              ? "Crew move locked. Waiting for next scene..."
              : "Crew Lead can lock your move. Make it count."}
          </p>
        )}
      </section>
    </PhoneShell>
  );
}