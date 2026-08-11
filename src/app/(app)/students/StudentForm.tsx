"use client";

import { useActionState } from "react";
import { FieldWrapper, TextInput } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { FormState } from "@/lib/formState";
import type { Student } from "@/generated/prisma/client";

type StudentFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function StudentForm({
  action,
  student,
  submitLabel = "שמירה",
}: {
  action: StudentFormAction;
  student?: Student;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.success && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="שם פרטי" htmlFor="firstName" required>
          <TextInput
            id="firstName"
            name="firstName"
            defaultValue={student?.firstName}
            required
          />
        </FieldWrapper>
        <FieldWrapper label="שם משפחה" htmlFor="lastName" required>
          <TextInput id="lastName" name="lastName" defaultValue={student?.lastName} required />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="מספר תלמיד" htmlFor="studentNumber" required>
          <TextInput
            id="studentNumber"
            name="studentNumber"
            defaultValue={student?.studentNumber}
            required
          />
        </FieldWrapper>
        <FieldWrapper label="כיתה" htmlFor="className" required>
          <TextInput id="className" name="className" defaultValue={student?.className} required />
        </FieldWrapper>
      </div>

      <FieldWrapper label="אימייל" htmlFor="email" hint="אופציונלי">
        <TextInput id="email" name="email" type="email" defaultValue={student?.email ?? ""} />
      </FieldWrapper>

      <label className="flex w-fit items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={student?.active ?? true}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        תלמיד פעיל
      </label>

      <div className="mt-2 flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
