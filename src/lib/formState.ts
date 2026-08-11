/**
 * Shared shape returned by server actions that back `useActionState`
 * forms. `null` = no submission yet (initial render).
 */
export type FormState = {
  success: boolean;
  message?: string;
} | null;
