"use client";

import { useState, useTransition } from "react";
import { setAssessmentPublishedAction } from "./actions";

export function PublishToggleButton({
  courseId,
  assessmentId,
  published,
}: {
  courseId: string;
  assessmentId: string;
  published: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await setAssessmentPublishedAction(courseId, assessmentId, !published);
      if (result && !result.success) {
        setError(result.message ?? "אירעה שגיאה בעדכון סטטוס הפרסום");
      }
    });
  };

  return (
    <span className="inline-flex max-w-56 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="whitespace-nowrap font-medium text-slate-500 hover:text-brand-600 disabled:opacity-50"
      >
        {isPending ? "מעדכן..." : published ? "ביטול פרסום" : "פרסום"}
      </button>
      {error ? <span className="text-red-600">{error}</span> : null}
    </span>
  );
}
