import Link from "next/link";
import { FileBarChart } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "דוחות | GradeFlow" };

export default async function ReportsPage() {
  const user = await requireUser();
  const courses = await courseService.listForActor(user);

  return (
    <div>
      <PageHeader
        title="דוחות"
        description="דוחות ציונים לפי מקצוע, ותעודות אישיות לתלמיד"
      />

      <Card>
        <CardHeader
          title="דוחות מקצוע"
          description="ציונים סופיים ופירוט הערכות עבור כל תלמידי המקצוע"
        />
        <CardBody className="p-0">
          {courses.length === 0 ? (
            <EmptyState icon={FileBarChart} title="אין מקצועות זמינים לדוח" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {courses.map((course) => (
                <li key={course.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{course.name}</p>
                    <p className="text-xs text-slate-500">{course.code} · {course.schoolYear}</p>
                  </div>
                  <Link
                    href={`/reports/course/${course.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    פתיחת דוח
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-sm text-slate-500">
        לתעודת תלמיד בודד: היכנסו למקצוע הרלוונטי → &quot;ציונים סופיים&quot; → &quot;תעודה&quot; ליד שם התלמיד.
      </p>
    </div>
  );
}
