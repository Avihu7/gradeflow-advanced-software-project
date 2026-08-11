import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileBarChart,
  Settings,
} from "lucide-react";
import type { Role } from "@/generated/prisma/client";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "לוח בקרה", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER"] },
  { href: "/students", label: "תלמידים", icon: Users, roles: ["ADMIN"] },
  { href: "/courses", label: "מקצועות", icon: BookOpen, roles: ["ADMIN", "TEACHER"] },
  { href: "/reports", label: "דוחות", icon: FileBarChart, roles: ["ADMIN", "TEACHER"] },
  { href: "/settings", label: "הגדרות", icon: Settings, roles: ["ADMIN", "TEACHER"] },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
