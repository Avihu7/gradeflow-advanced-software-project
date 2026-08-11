"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setStudentActiveAction } from "../actions";

export function ToggleActiveButton({
  studentId,
  active,
}: {
  studentId: string;
  active: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      setStudentActiveAction(studentId, !active);
    });
  };

  return (
    <Button variant={active ? "danger" : "secondary"} size="sm" disabled={isPending} onClick={handleClick}>
      {isPending
        ? "מעדכן..."
        : armed
          ? "לחצו שוב לאישור"
          : active
            ? "השבתת תלמיד"
            : "הפעלת תלמיד"}
    </Button>
  );
}
