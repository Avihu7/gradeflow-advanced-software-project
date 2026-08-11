import type { SessionUser } from "@/lib/auth/session";

export interface GradeSubmissionContext {
  actor: SessionUser;
  courseId: string;
  assessmentId: string;
  studentId: string;
  /** null clears the grade; undefined means "not provided", treated as invalid at this layer. */
  score: number | null | undefined;
}
