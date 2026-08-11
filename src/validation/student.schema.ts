import { z } from "zod";

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, "יש להזין שם פרטי").max(60),
  lastName: z.string().trim().min(1, "יש להזין שם משפחה").max(60),
  studentNumber: z
    .string()
    .trim()
    .min(1, "יש להזין מספר תלמיד")
    .max(20)
    .regex(/^[0-9A-Za-z-]+$/, "מספר תלמיד יכול להכיל ספרות, אותיות ומקף בלבד"),
  email: z
    .union([z.string().trim().email("כתובת אימייל לא תקינה"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  className: z.string().trim().min(1, "יש להזין כיתה").max(30),
  active: z.boolean().default(true),
});

export type StudentInput = z.infer<typeof studentSchema>;
