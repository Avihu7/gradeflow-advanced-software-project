"use client";

import { useActionState } from "react";
import { FieldWrapper, TextInput, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { FormState } from "@/lib/formState";
import type { Course } from "@/generated/prisma/client";

type CourseFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function CourseForm({
  action,
  course,
  submitLabel = "שמירה",
}: {
  action: CourseFormAction;
  course?: Course;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.success && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <FieldWrapper label="שם המקצוע" htmlFor="name" required>
        <TextInput id="name" name="name" defaultValue={course?.name} required />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="קוד מקצוע" htmlFor="code" required hint="לדוגמה: MATH-10">
          <TextInput id="code" name="code" defaultValue={course?.code} required />
        </FieldWrapper>
        <FieldWrapper label="שנת לימודים" htmlFor="schoolYear" required hint='לדוגמה: תשפ"ו'>
          <TextInput id="schoolYear" name="schoolYear" defaultValue={course?.schoolYear} required />
        </FieldWrapper>
      </div>

      <FieldWrapper label="תיאור" htmlFor="description" hint="אופציונלי">
        <Textarea id="description" name="description" rows={3} defaultValue={course?.description ?? ""} />
      </FieldWrapper>

      <div className="mt-2 flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
