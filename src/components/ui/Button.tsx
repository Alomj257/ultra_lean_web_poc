"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
}

export default function Button({
  children,
  variant = "outline",
  className = "",
  ...props
}: Props) {
  return (
    <button className={`btn ${variant} ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}