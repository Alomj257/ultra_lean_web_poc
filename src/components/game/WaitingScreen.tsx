import PhoneShell from "@/components/layout/PhoneShell";
import TopBar from "@/components/layout/TopBar";

export default function WaitingScreen({
  role,
}: {
  role: string;
}) {
  return (
    <PhoneShell>
      <TopBar title={role} />

      <section className="white-card wait-card">
        <div className="checkmark">✓</div>
        <h2>Move locked.</h2>
        <p>Waiting for partner...</p>
      </section>
    </PhoneShell>
  );
}