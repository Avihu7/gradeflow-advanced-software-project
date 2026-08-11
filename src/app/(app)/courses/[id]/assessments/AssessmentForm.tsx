"use client";

import { useActionState } from "react";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { ASSESSMENT_TYPES, assessmentTypeLabels } from "@/validation/assessment.schema";
import type { FormState } from "@/lib/formState";
import type { Assessment } from "@/generated/prisma/client";

type AssessmentFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function AssessmentForm({
  action,
  assessment,
  currentTotalWeight,
  submitLabel = "שמירה",
}: {
  action: AssessmentFormAction;
  assessment?: Assessment;
  /** Total weight of all *other* assessments already in the course, for context. */
  currentTotalWeight: number;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.success && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        סכום המשקלים הנוכחי של הערכות אחרות במקצוע זה: <strong>{currentTotalWeight}%</strong>
      </p>

      <FieldWrapper label="כותרת ההערכה" htmlFor="title" required>
        <TextInput id="title" name="title" defaultValue={assessment?.title} required />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldWrapper label="סוג הערכה" htmlFor="type" required>
          <Select id="type" name="type" defaultValue={assessment?.type ?? "EXAM"} required>
            {ASSESSMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {assessmentTypeLabels[type]}
              </option>
            ))}
          </Select>
        </FieldWrapper>

        <FieldWrapper label="משקל (%)" htmlFor="weight" required>
          <TextInput
            id="weight"
            name="weight"
            type="number"
            min={0.01}
            max={100}
            step={0.01}
            defaultValue={assessment ? Number(assessment.weight) : undefined}
            required
          />
        </FieldWrapper>

        <FieldWrapper label="תאריך" htmlFor="date" required>
          <TextInput
            id="date"
            name="date"
            type="date"
            defaultValue={assessment ? toDateInputValue(assessment.date) : undefined}
            required
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label="תיאור" htmlFor="description" hint="אופציונלי">
        <Textarea id="description" name="description" rows={3} defaultValue={assessment?.description ?? ""} />
      </FieldWrapper>

      <div className="mt-2 flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
