import { ReactNode } from "react";

export default function PhoneShell({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <main className={dark ? "phone phone-dark" : "phone phone-light"}>
      {children}
    </main>
  );
}