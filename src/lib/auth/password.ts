/**
 * Password hashing helpers.
 *
 * Passwords are never stored or compared in plain text. `bcryptjs` salts
 * and hashes on write, and does a constant-time comparison on read.
 */
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
