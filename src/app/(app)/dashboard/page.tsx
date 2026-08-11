import Link from "next/link";
import { Users, BookOpen, ClipboardList, PenLine, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { dashboardService } from "@/services/dashboard.service";
import { courseService } from "@/services/course.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { formatGrade } from "@/lib/utils";

export const metadata = { title: "לוח בקרה | GradeFlow" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [metrics, courses] = await Promise.all([
    dashboardService.getMetrics(user),
    courseService.listForActor(user),
  ]);

  return (
    <div>
      <PageHeader
        title={`שלום, ${user.name.split(" ")[0]}`}
        description={
          user.role === "ADMIN"
            ? "סקירה כללית של המערכת"
            : "סקירה של המקצועות שלך"
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="תלמידים פעילים" value={metrics.activeStudents} />
        <StatCard icon={BookOpen} label="מקצועות" value={metrics.courses} tone="green" />
        <StatCard icon={ClipboardList} label="הערכות" value={metrics.assessments} tone="amber" />
        <StatCard icon={PenLine} label="ציונים שהוזנו" value={metrics.gradesEntered} />
        <StatCard
          icon={TrendingUp}
          label="ציון ממוצע"
          value={metrics.averageGrade !== null ? formatGrade(metrics.averageGrade) : "—"}
          tone="green"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title={user.role === "ADMIN" ? "כל המקצועות" : "המקצועות שלי"}
          description="גישה מהירה לניהול מקצוע"
          action={<LinkButton href="/courses" variant="secondary" size="sm">לכל המקצועות</LinkButton>}
        />
        <CardBody>
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="אין עדיין מקצועות"
              description={
                user.role === "ADMIN"
                  ? "צרו מקצוע חדש כדי להתחיל."
                  : "טרם שויכת למקצוע כלשהו. פנו למנהל המערכת."
              }
              action={
                user.role === "ADMIN" ? (
                  <LinkButton href="/courses/new" size="sm">מקצוע חדש</LinkButton>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <p className="font-semibold text-slate-900">{course.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {course.code} · {course.schoolYear}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {course._count.enrollments} תלמידים · {course._count.assessments} הערכות
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
