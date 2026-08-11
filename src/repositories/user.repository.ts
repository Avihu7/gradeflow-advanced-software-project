import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return db.user.findUnique({ where: { id } });
  },

  findTeachers() {
    return db.user.findMany({
      where: { role: "TEACHER" as Role },
      orderBy: { name: "asc" },
    });
  },

  create(data: { name: string; email: string; passwordHash: string; role: Role }) {
    return db.user.create({ data });
  },
};
