"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";

/**
 * Small icon button for low-risk-but-worth-confirming removals (unassign
 * teacher, unenroll student). Uses an in-place "click again to confirm"
 * state instead of a native `window.confirm()` dialog: native dialogs
 * are jarring in a modern SaaS UI, block all other page interaction
 * while open, and (as observed in testing) can leave an automated or
 * screen-reader-driven session stuck with no way to dismiss them.
 */
export function ConfirmActionButton({
  confirmMessage,
  action,
  label,
}: {
  confirmMessage: string;
  action: () => Promise<void>;
  label: string;
}) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Auto-disarm after a few seconds so an accidental first click can't
  // be "confirmed" by an unrelated later click.
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    startTransition(() => {
      action();
    });
  };

  if (armed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title={confirmMessage}
        className="whitespace-nowrap rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {isPending ? "מבצע..." : "לחצו שוב לאישור"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
