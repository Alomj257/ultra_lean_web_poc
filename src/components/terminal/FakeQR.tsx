"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function FakeQR({ small = false }: { small?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fakeRewardText = `FAKE-REWARD-${Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase()}`;

    QRCode.toCanvas(canvasRef.current, fakeRewardText, {
      width: small ? 142 : 154,
      margin: 2,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });
  }, [small]);

  return (
    <canvas
      ref={canvasRef}
      className={small ? "fake-qr small" : "fake-qr"}
      aria-label="fake reward qr"
    />
  );
}