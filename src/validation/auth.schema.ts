import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "יש להזין כתובת אימייל").email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "יש להזין סיסמה"),
});

export type LoginInput = z.infer<typeof loginSchema>;
