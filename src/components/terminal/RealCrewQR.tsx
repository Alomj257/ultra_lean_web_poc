"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function RealCrewQR({ crewCode }: { crewCode: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !crewCode) return;

    const joinUrl = `${window.location.origin}?code=${crewCode}`;

    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });
  }, [crewCode]);

  return <canvas ref={canvasRef} className="real-qr" />;
}