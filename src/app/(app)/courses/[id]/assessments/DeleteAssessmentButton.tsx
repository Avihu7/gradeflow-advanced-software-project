"use client";

import { useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAssessmentAction } from "./actions";

export function DeleteAssessmentButton({
  courseId,
  assessmentId,
  title,
}: {
  courseId: string;
  assessmentId: string;
  title: string;
}) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    setError(null);
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    startTransition(async () => {
      const result = await deleteAssessmentAction(courseId, assessmentId);
      if (result && !result.success) {
        setError(result.message ?? "אירעה שגיאה במחיקת ההערכה");
      }
    });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title={armed ? `לחצו שוב כדי למחוק את "${title}"` : "מחיקת הערכה"}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {isPending ? "מוחק..." : armed ? "לחצו שוב לאישור" : "מחיקה"}
      </button>
      {error ? <span className="text-red-600">{error}</span> : null}
    </span>
  );
}
