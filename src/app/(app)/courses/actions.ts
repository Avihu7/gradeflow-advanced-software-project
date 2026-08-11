"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { courseSchema } from "@/validation/course.schema";
import { toUserMessage } from "@/domain/errors";
import type { FormState } from "@/lib/formState";

function parseCourseForm(formData: FormData) {
  return courseSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    schoolYear: formData.get("schoolYear"),
    description: formData.get("description") ?? "",
  });
}

export async function createCourseAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("ADMIN");

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  let courseId: string;
  try {
    const course = await courseService.create(actor, parsed.data);
    courseId = course.id;
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath("/courses");
  redirect(`/courses/${courseId}`);
}

export async function updateCourseAction(
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireRole("ADMIN");

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "פרטים לא תקינים" };
  }

  try {
    await courseService.update(actor, courseId, parsed.data);
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function assignTeacherAction(courseId: string, formData: FormData) {
  const actor = await requireRole("ADMIN");
  const teacherId = String(formData.get("teacherId") ?? "");
  if (!teacherId) return;
  await courseService.assignTeacher(actor, courseId, teacherId);
  revalidatePath(`/courses/${courseId}`);
}

export async function removeTeacherAction(courseId: string, teacherId: string) {
  const actor = await requireRole("ADMIN");
  await courseService.removeTeacher(actor, courseId, teacherId);
  revalidatePath(`/courses/${courseId}`);
}

export async function enrollStudentAction(courseId: string, formData: FormData) {
  const actor = await requireRole("ADMIN");
  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) return;
  await courseService.enrollStudent(actor, courseId, studentId);
  revalidatePath(`/courses/${courseId}`);
}

export async function unenrollStudentAction(courseId: string, studentId: string) {
  const actor = await requireRole("ADMIN");
  await courseService.unenrollStudent(actor, courseId, studentId);
  revalidatePath(`/courses/${courseId}`);
}
