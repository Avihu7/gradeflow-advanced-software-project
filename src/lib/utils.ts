import { clsx, type ClassValue } from "clsx";

/** Merges conditional class names. Thin wrapper so call sites read `cn(...)`. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Formats a number as a grade string with up to 2 decimal places, trimming trailing zeros. */
export function formatGrade(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value.toFixed(2)).toString();
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
