import { z } from "zod";

export const ASSESSMENT_TYPES = [
  "EXAM",
  "QUIZ",
  "ASSIGNMENT",
  "PROJECT",
  "PARTICIPATION",
  "OTHER",
] as const;

export const assessmentTypeLabels: Record<(typeof ASSESSMENT_TYPES)[number], string> = {
  EXAM: "מבחן",
  QUIZ: "בוחן",
  ASSIGNMENT: "עבודה",
  PROJECT: "פרויקט",
  PARTICIPATION: "השתתפות",
  OTHER: "אחר",
};

export const assessmentSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(1, "יש להזין כותרת להערכה").max(150),
  type: z.enum(ASSESSMENT_TYPES, { message: "יש לבחור סוג הערכה" }),
  weight: z
    .coerce.number({ message: "משקל חייב להיות מספר" })
    .gt(0, "המשקל חייב להיות גדול מ-0")
    .max(100, "המשקל לא יכול לעלות על 100"),
  date: z.coerce.date({ message: "יש לבחור תאריך" }),
  description: z
    .union([z.string().trim().max(1000), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  published: z.boolean().default(false),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;
