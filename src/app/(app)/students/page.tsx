import { Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { studentService } from "@/services/student.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "תלמידים | GradeFlow" };

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("ADMIN");
  const { q } = await searchParams;

  const students = await studentService.list({ search: q });

  return (
    <div>
      <PageHeader
        title="תלמידים"
        description="ניהול רשימת התלמידים במערכת"
        action={
          <LinkButton href="/students/new">
            <UserPlus className="h-4 w-4" />
            תלמיד חדש
          </LinkButton>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form className="relative max-w-sm">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              name="q"
              defaultValue={q}
              placeholder="חיפוש לפי שם, מספר תלמיד או כיתה..."
              className="pr-9"
            />
          </form>
        </div>

        <CardBody className="p-0">
          {students.length === 0 ? (
            <EmptyState
              icon={Users}
              title={q ? "לא נמצאו תלמידים" : "אין עדיין תלמידים"}
              description={q ? "נסו חיפוש אחר." : "הוסיפו תלמיד ראשון כדי להתחיל."}
              action={!q ? <LinkButton href="/students/new" size="sm">תלמיד חדש</LinkButton> : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">שם</th>
                    <th className="px-4 py-3 font-medium">מספר תלמיד</th>
                    <th className="px-4 py-3 font-medium">כיתה</th>
                    <th className="px-4 py-3 font-medium">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-slate-900 hover:text-brand-600"
                        >
                          {student.firstName} {student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{student.studentNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{student.className}</td>
                      <td className="px-4 py-3">
                        {student.active ? (
                          <Badge tone="green">פעיל</Badge>
                        ) : (
                          <Badge tone="slate">לא פעיל</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
