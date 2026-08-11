"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { assessmentService } from "@/services/assessment.service";
import { assessmentSchema } from "@/validation/assessment.schema";
import { toUserMessage } from "@/domain/errors";
import type { FormState } from "@/lib/formState";

function parseAssessmentForm(courseId: string, formData: FormData) {
  return assessmentSchema.safeParse({
    courseId,
    title: formData.get("title"),
    type: formData.get("type"),
    weight: formData.get("weight"),
    date: formData.get("date"),
    description: formData.get("description") ?? "",
  });
}

export async function createAssessmentAction(
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireUser();

  const parsed = parseAssessmentForm(courseId, formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await assessmentService.create(actor, parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function updateAssessmentAction(
  courseId: string,
  assessmentId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireUser();

  const parsed = parseAssessmentForm(courseId, formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await assessmentService.update(actor, assessmentId, parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

/**
 * These two actions are invoked directly from client event handlers
 * (not a <form action=...>), so - unlike the actions above - they
 * return a result object rather than throwing. Server Action errors are
 * redacted to a generic message in production; returning a typed result
 * is the reliable way to get a specific, translated message back to the
 * client in every environment.
 */
export async function deleteAssessmentAction(
  courseId: string,
  assessmentId: string,
): Promise<FormState> {
  const actor = await requireUser();
  try {
    await assessmentService.delete(actor, assessmentId, courseId);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }
  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}

export async function setAssessmentPublishedAction(
  courseId: string,
  assessmentId: string,
  published: boolean,
): Promise<FormState> {
  const actor = await requireUser();
  try {
    await assessmentService.setPublished(actor, assessmentId, courseId, published);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/final-grades`);
  return {
    success: true,
    message: published ? "ההערכה פורסמה בהצלחה" : "פרסום ההערכה בוטל",
  };
}
