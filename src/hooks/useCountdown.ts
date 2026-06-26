"use client";

import { useEffect, useRef, useState } from "react";

export function useCountdown(
  seconds: number,
  enabled: boolean,
  onExpire?: () => void
) {
  const [remaining, setRemaining] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    firedRef.current = false;
    setRemaining(seconds);

    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);

          if (!firedRef.current) {
            firedRef.current = true;
            onExpire?.();
          }

          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [seconds, enabled, onExpire]);

  return remaining;
}