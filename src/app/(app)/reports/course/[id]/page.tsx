import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { reportService } from "@/services/report.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PrintButton } from "@/components/ui/PrintButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { formatGrade, formatDate } from "@/lib/utils";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "דוח מקצוע | GradeFlow" };

export default async function CourseReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const report = await reportService.getCourseReport(user, id).catch((error) => {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!report) notFound();

  const { course, rows } = report;
  const publishedAssessments = course.assessments.filter((a) => a.published);

  return (
    <div className="print-area">
      <PageHeader
        title={`דוח ציונים - ${course.name}`}
        description={`${course.code} · שנת לימודים ${course.schoolYear} · הופק בתאריך ${formatDate(new Date())}`}
        action={<PrintButton />}
      />

      <Card>
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <EmptyState icon={Users} title="אין תלמידים רשומים למקצוע" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">תלמיד</th>
                    <th className="px-4 py-3 font-medium">מספר תלמיד</th>
                    {publishedAssessments.map((a) => (
                      <th key={a.id} className="px-4 py-3 font-medium">
                        {a.title} ({Number(a.weight)}%)
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">ציון סופי</th>
                    <th className="px-4 py-3 font-medium">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.student.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.student.studentNumber}</td>
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
