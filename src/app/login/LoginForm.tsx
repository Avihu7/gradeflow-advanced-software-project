"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { FieldWrapper, TextInput } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.success && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <FieldWrapper label="אימייל" htmlFor="email" required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="teacher@gradeflow.school"
          required
        />
      </FieldWrapper>

      <FieldWrapper label="סיסמה" htmlFor="password" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </FieldWrapper>

      <SubmitButton pendingLabel="מתחבר..." className="mt-2 w-full">
        התחברות
      </SubmitButton>
    </form>
  );
}
