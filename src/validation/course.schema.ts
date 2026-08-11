import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().trim().min(1, "יש להזין שם מקצוע").max(100),
  code: z
    .string()
    .trim()
    .min(1, "יש להזין קוד מקצוע")
    .max(20)
    .regex(/^[0-9A-Za-z-]+$/, "קוד מקצוע יכול להכיל ספרות, אותיות ומקף בלבד"),
  schoolYear: z
    .string()
    .trim()
    .min(1, "יש להזין שנת לימודים")
    .max(20),
  description: z
    .union([z.string().trim().max(1000), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const assignTeacherSchema = z.object({
  courseId: z.string().min(1),
  teacherId: z.string().min(1, "יש לבחור מורה"),
});

export const enrollStudentSchema = z.object({
  courseId: z.string().min(1),
  studentId: z.string().min(1, "יש לבחור תלמיד"),
});
