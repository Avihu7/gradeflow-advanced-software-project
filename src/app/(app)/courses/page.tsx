import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "מקצועות | GradeFlow" };

export default async function CoursesPage() {
  const user = await requireUser();
  const courses = await courseService.listForActor(user);

  return (
    <div>
      <PageHeader
        title="מקצועות"
        description={user.role === "ADMIN" ? "ניהול כלל המקצועות במערכת" : "המקצועות שאתם מלמדים"}
        action={
          user.role === "ADMIN" ? (
            <LinkButton href="/courses/new">
              <Plus className="h-4 w-4" />
              מקצוע חדש
            </LinkButton>
          ) : undefined
        }
      />

      <Card>
        <CardBody className="p-0">
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="אין מקצועות להצגה"
              description={
                user.role === "ADMIN"
                  ? "צרו מקצוע חדש כדי להתחיל."
                  : "טרם שויכתם למקצוע. פנו למנהל המערכת."
              }
              action={
                user.role === "ADMIN" ? (
                  <LinkButton href="/courses/new" size="sm">מקצוע חדש</LinkButton>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">מקצוע</th>
                    <th className="px-4 py-3 font-medium">קוד</th>
                    <th className="px-4 py-3 font-medium">שנה&quot;ל</th>
                    <th className="px-4 py-3 font-medium">מורה</th>
                    <th className="px-4 py-3 font-medium">תלמידים</th>
                    <th className="px-4 py-3 font-medium">הערכות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/courses/${course.id}`}
                          className="font-medium text-slate-900 hover:text-brand-600"
                        >
                          {course.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{course.code}</td>
                      <td className="px-4 py-3 text-slate-600">{course.schoolYear}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {course.teacherCourses.map((tc) => tc.teacher.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{course._count.enrollments}</td>
                      <td className="px-4 py-3 text-slate-600">{course._count.assessments}</td>
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
