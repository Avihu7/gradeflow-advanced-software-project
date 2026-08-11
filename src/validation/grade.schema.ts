import { z } from "zod";

export const gradeEntrySchema = z.object({
  assessmentId: z.string().min(1),
  studentId: z.string().min(1),
  score: z
    .union([
      z
        .coerce.number({ message: "הציון חייב להיות מספר" })
        .min(0, "לא ניתן לשמור ציון מחוץ לטווח 0–100")
        .max(100, "לא ניתן לשמור ציון מחוץ לטווח 0–100"),
      z.null(),
    ])
    .optional(),
  feedback: z
    .union([z.string().trim().max(500), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type GradeEntryInput = z.infer<typeof gradeEntrySchema>;

/** A full grade-sheet submission for one assessment: one row per student. */
export const bulkGradeSubmissionSchema = z.object({
  assessmentId: z.string().min(1),
  entries: z.array(
    z.object({
      studentId: z.string().min(1),
      score: z
        .union([
          z
            .coerce.number()
            .min(0, "לא ניתן לשמור ציון מחוץ לטווח 0–100")
            .max(100, "לא ניתן לשמור ציון מחוץ לטווח 0–100"),
          z.null(),
        ])
        .optional(),
      feedback: z.string().trim().max(500).optional(),
    }),
  ),
});

export type BulkGradeSubmissionInput = z.infer<typeof bulkGradeSubmissionSchema>;
