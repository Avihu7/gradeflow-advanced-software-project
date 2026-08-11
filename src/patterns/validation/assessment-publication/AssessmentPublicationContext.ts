import type { SessionUser } from "@/lib/auth/session";

export interface AssessmentPublicationContext {
  actor: SessionUser;
  courseId: string;
  assessmentId: string;
  /** The weight of the assessment being published (not yet saved as published). */
  weight: number;
}
