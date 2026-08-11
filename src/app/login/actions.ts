"use server";

import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth/session";
import { authService } from "@/services/auth.service";
import { loginSchema } from "@/validation/auth.schema";
import { toUserMessage } from "@/domain/errors";
import type { FormState } from "@/lib/formState";

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await authService.login(parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function redirectIfAuthenticated() {
  const user = await getSession();
  if (user) redirect("/dashboard");
}
