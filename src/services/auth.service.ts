import { userRepository } from "@/repositories/user.repository";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { ValidationError } from "@/domain/errors";
import type { LoginInput } from "@/validation/auth.schema";

export const authService = {
  async login(input: LoginInput): Promise<void> {
    const user = await userRepository.findByEmail(input.email);

    // Deliberately identical error for "no such user" and "wrong password"
    // so the login form never reveals which part was incorrect.
    const genericError = "אימייל או סיסמה שגויים";

    if (!user) {
      throw new ValidationError(genericError);
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new ValidationError(genericError);
    }

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  },

  async logout(): Promise<void> {
    await destroySession();
  },
};
