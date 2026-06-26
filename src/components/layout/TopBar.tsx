import { ReactNode } from "react";

export default function TopBar({
  title,
  timer,
}: {
  title: string;
  timer?: ReactNode;
}) {
  return (
    <header className="topbar">
      <span className="hamb">☰</span>
      <strong>{title}</strong>
      <span>{timer}</span>
    </header>
  );
}