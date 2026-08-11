"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { studentService } from "@/services/student.service";
import { studentSchema } from "@/validation/student.schema";
import { toUserMessage } from "@/domain/errors";
import type { FormState } from "@/lib/formState";

function parseStudentForm(formData: FormData) {
  return studentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    studentNumber: formData.get("studentNumber"),
    email: formData.get("email") ?? "",
    className: formData.get("className"),
    active: formData.get("active") === "on",
  });
}

export async function createStudentAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("ADMIN");

  const parsed = parseStudentForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await studentService.create(actor, parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudentAction(
  studentId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("ADMIN");

  const parsed = parseStudentForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await studentService.update(actor, studentId, parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  redirect(`/students/${studentId}`);
}

export async function setStudentActiveAction(studentId: string, active: boolean) {
  const actor = await requireRole("ADMIN");
  await studentService.setActive(actor, studentId, active);
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}
