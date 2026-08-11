import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { gradeService } from "@/services/grade.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Users, FileText } from "lucide-react";
import { formatGrade } from "@/lib/utils";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "ציונים סופיים | GradeFlow" };

export default async function FinalGradesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const course = await courseService.getByIdForActor(user, id).catch((error) => {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!course) notFound();

  const rows = await gradeService.getFinalGradesForCourse(id);
  const publishedAssessments = course.assessments.filter((a) => a.published);

  return (
    <div>
      <PageHeader
        title="ציונים סופיים"
        description={`${course.name} · ממוצע משוקלל לפי ${publishedAssessments.length} הערכות מפורסמות`}
      />

      <Card>
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <EmptyState icon={Users} title="אין תלמידים רשומים למקצוע" />
          ) : publishedAssessments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="אין עדיין הערכות מפורסמות"
              description="פרסמו לפחות הערכה אחת כדי לחשב ציון סופי."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">תלמיד</th>
                    {publishedAssessments.map((a) => (
                      <th key={a.id} className="px-4 py-3 font-medium">
                        {a.title}
                        <span className="block font-normal normal-case text-slate-400">
                          {Number(a.weight)}%
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">ציון סופי</th>
                    <th className="px-4 py-3 font-medium">סטטוס</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      {row.perAssessment.map((pa) => (
                        <td key={pa.assessment.id} className="px-4 py-3 text-slate-600">
                          {formatGrade(pa.score)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-base font-bold text-slate-900">
                        {formatGrade(row.finalGrade)}
                      </td>
                      <td className="px-4 py-3">
                        {row.isComplete ? (
                          <Badge tone="green">סופי</Badge>
                        ) : row.finalGrade !== null ? (
                          <Badge tone="amber">חלקי</Badge>
                        ) : (
                          <Badge tone="slate">אין ציונים</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <LinkButton href={`/reports/student/${row.student.id}`} variant="ghost" size="sm">
                          תעודה
                        </LinkButton>
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
