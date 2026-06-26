"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  seconds: number;
  enabled?: boolean;
  onExpire?: () => void;
}

export default function TimerPill({
  seconds,
  enabled = true,
  onExpire,
}: Props) {
  const remaining = useCountdown(seconds, enabled, onExpire);

  return <span className="timer-pill">{remaining}s</span>;
}