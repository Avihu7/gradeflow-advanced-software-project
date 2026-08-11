/**
 * Domain-level error types.
 *
 * Services and the validation chain throw these instead of generic
 * `Error`s so that:
 *  - server actions can catch a known error type and turn it into a
 *    friendly Hebrew message for the UI, and
 *  - unexpected/unknown errors (bugs, DB outages, etc.) are never leaked
 *    to the client - they get logged server-side and the user sees a
 *    generic "something went wrong" message instead of a stack trace.
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/** Thrown when input fails validation (Zod schema or business rule). */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Thrown when the caller is authenticated but not allowed to do this. */
export class ForbiddenError extends DomainError {
  constructor(message = "אין לך הרשאה לבצע פעולה זו") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Thrown when a referenced entity does not exist. */
export class NotFoundError extends DomainError {
  constructor(message = "הרשומה המבוקשת לא נמצאה") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Thrown for state conflicts, e.g. duplicate unique fields. */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Type guard used by server actions to safely surface domain errors. */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/** Converts any thrown value into a safe, user-facing Hebrew message. */
export function toUserMessage(error: unknown): string {
  if (isDomainError(error)) return error.message;
  console.error("Unexpected error:", error);
  return "אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.";
}
