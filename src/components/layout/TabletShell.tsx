import { ReactNode } from "react";

export default function TabletShell({ children }: { children: ReactNode }) {
  return (
    <main className="tablet-wrap">
      <section className="tablet-frame">{children}</section>
    </main>
  );
}