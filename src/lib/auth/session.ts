/**
 * Session management.
 *
 * GradeFlow does not use a full auth framework - it implements a small,
 * explicit, credentials-based session of its own:
 *
 *  1. On successful login we sign a compact JWT (HS256, via `jose`) that
 *     carries the minimal identity claims we need (user id, role, name).
 *  2. The JWT is stored in an httpOnly, sameSite=lax cookie so client-side
 *     JavaScript can never read or tamper with it, and it is marked
 *     `secure` outside of local development.
 *  3. Every server component / server action that needs to know "who is
 *     calling" reads and verifies this cookie via `getSession()`.
 *
 * All authorization decisions (see `requireUser` / `requireRole` below,
 * and the Chain of Responsibility validators in `src/patterns/validation`)
 * happen on the server. The UI may also hide buttons for clarity, but
 * that is a courtesy, never the enforcement mechanism.
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma/client";

const COOKIE_NAME = "gradeflow_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set (or too short). Configure it in .env.",
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Reads and verifies the session cookie. Returns `null` if there is no
 * session, or if the token is missing/expired/tampered with - it never
 * throws for the "not logged in" case, so callers can decide what to do.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** Server-side guard: redirects unauthenticated users to /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Server-side guard: redirects unauthenticated users to /login, and
 * throws a `ForbiddenError` if the authenticated user's role is not in
 * the allowed list. This is the enforcement point for role-based access
 * on pages; individual write operations are additionally checked in the
 * service layer / validation chain so authorization is never only a UI
 * concern.
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}
