"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { gradeService } from "@/services/grade.service";
import { toUserMessage } from "@/domain/errors";
import type { FormState } from "@/lib/formState";

const SCORE_PREFIX = "score__";
const FEEDBACK_PREFIX = "feedback__";

export async function saveGradeSheetAction(
  courseId: string,
  assessmentId: string,
  studentIds: string[],
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireUser();

  const entries = studentIds.map((studentId) => {
    const rawScore = formData.get(`${SCORE_PREFIX}${studentId}`);
    const rawFeedback = formData.get(`${FEEDBACK_PREFIX}${studentId}`);

    const scoreText = typeof rawScore === "string" ? rawScore.trim() : "";
    const score = scoreText === "" ? null : Number(scoreText);

    return {
      studentId,
      score: score !== null && Number.isNaN(score) ? null : score,
      feedback: typeof rawFeedback === "string" && rawFeedback.trim() ? rawFeedback.trim() : undefined,
    };
  });

  try {
    await gradeService.submitBulkGrades(actor, { courseId, assessmentId, entries });
  } catch (error) {
    return { success: false, message: toUserMessage(error) };
  }

  revalidatePath(`/courses/${courseId}/assessments/${assessmentId}/grades`);
  revalidatePath(`/courses/${courseId}/final-grades`);
  revalidatePath(`/courses/${courseId}`);

  return { success: true, message: "הציונים נשמרו בהצלחה" };
}
