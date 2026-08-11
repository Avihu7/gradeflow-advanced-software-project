"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

/** Submit button that shows a pending label while its parent form action is running. */
export function SubmitButton({
  children,
  pendingLabel = "שומר...",
  variant = "primary",
  size = "md",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
