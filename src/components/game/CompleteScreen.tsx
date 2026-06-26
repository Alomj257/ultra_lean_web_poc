import PhoneShell from "@/components/layout/PhoneShell";
import { KEY_SIGNATURE } from "@/constants/gameData";
import { GameSession } from "@/types/game";

export default function CompleteScreen({
  session,
}: {
  session: GameSession;
}) {
  const success = session.finalOutcome === "success";

  return (
    <PhoneShell>
      <section className="result-box complete-box">
        <div className="checkmark">{success ? "✓" : "!"}</div>

        <h2>{success ? "Vault Ready" : "Near Unlock"}</h2>

        <p className="note">Trail marks stay hidden from guests.</p>

        <hr />

        <div className="key-row">
          <span>Key Signature</span>
          <b>{KEY_SIGNATURE.join(" ")}</b>
        </div>

        <p className="note">Use this at the Vault Terminal.</p>
      </section>
    </PhoneShell>
  );
}