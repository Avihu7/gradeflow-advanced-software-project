"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "./navItems";
import { logoutAction } from "@/app/login/actions";
import type { Role } from "@/generated/prisma/client";

const roleLabels: Record<string, string> = {
  ADMIN: "מנהל מערכת",
  TEACHER: "מורה",
};

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  // Icon components can't cross the Server -> Client boundary as props
  // (see src/app/(app)/layout.tsx), so nav items - which carry Lucide
  // icon references - are resolved here, inside the Client Component,
  // from the plain `role` string instead.
  const navItems = navItemsForRole(user.role);

  const navList = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-64 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold text-slate-900">GradeFlow</span>
        </div>
        {navList}
        <UserFooter user={user} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen ? (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-bold text-slate-900">GradeFlow</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="סגירת תפריט"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navList}
            <UserFooter user={user} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="no-print flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="פתיחת תפריט"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <Menu className="h-5.5 w-5.5" />
          </button>
          <span className="text-sm font-bold text-slate-900">GradeFlow</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function UserFooter({ user }: { user: { name: string; role: string } }) {
  return (
    <div className="border-t border-slate-100 p-3">
      <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">
            {roleLabels[user.role] ?? user.role}
          </p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          התנתקות
        </button>
      </form>
    </div>
  );
}
