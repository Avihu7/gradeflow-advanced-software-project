import { notFound } from "next/navigation";
import { GraduationCap, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { reportService } from "@/services/report.service";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PrintButton } from "@/components/ui/PrintButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatGrade, formatDate } from "@/lib/utils";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "תעודת תלמיד | GradeFlow" };

export default async function StudentReportCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const card = await reportService.getStudentReportCard(user, id).catch((error) => {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!card) notFound();

  const { student, courseResults } = card;

  const overallAverage =
    courseResults.length > 0
      ? courseResults.reduce((sum, cr) => sum + (cr.result.finalGrade ?? 0), 0) /
        courseResults.filter((cr) => cr.result.finalGrade !== null).length
      : null;

  return (
    <div className="print-area mx-auto max-w-3xl">
      <div className="no-print mb-4 flex justify-end">
        <PrintButton />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardBody>
          <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">GradeFlow</p>
                <p className="text-xs text-slate-500">מערכת לניהול מודול הערכה בית ספרי</p>
              </div>
            </div>
            <div className="text-left text-xs text-slate-500">
              <p>תאריך הפקה: {formatDate(new Date())}</p>
            </div>
          </header>

          <h1 className="mb-1 text-xl font-bold text-slate-900">תעודת ציונים</h1>
          <div className="mb-6 grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
            <p>
              <span className="text-slate-400">שם תלמיד: </span>
              {student.firstName} {student.lastName}
            </p>
            <p>
              <span className="text-slate-400">מספר תלמיד: </span>
              {student.studentNumber}
            </p>
            <p>
              <span className="text-slate-400">כיתה: </span>
              {student.className}
            </p>
            <p>
              <span className="text-slate-400">ממוצע כללי: </span>
              <strong>{overallAverage !== null && !Number.isNaN(overallAverage) ? formatGrade(overallAverage) : "—"}</strong>
            </p>
          </div>

          {courseResults.length === 0 ? (
            <EmptyState icon={BookOpen} title="התלמיד אינו רשום למקצועות" />
          ) : (
            <div className="flex flex-col gap-6">
              {courseResults.map(({ course, result }) => (
                <div key={course.id} className="rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                    <div>
                      <p className="font-semibold text-slate-900">{course.name}</p>
                      <p className="text-xs text-slate-500">
                        {course.code} · מורה:{" "}
                        {course.teacherCourses.map((tc) => tc.teacher.name).join(", ") || "—"}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-slate-900">{formatGrade(result.finalGrade)}</p>
                      {result.isComplete ? (
                        <Badge tone="green">סופי</Badge>
                      ) : result.finalGrade !== null ? (
                        <Badge tone="amber">חלקי</Badge>
                      ) : (
                        <Badge tone="slate">אין ציונים</Badge>
                      )}
                    </div>
                  </div>
                  {result.perAssessment.length > 0 ? (
                    <table className="w-full text-right text-xs">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="px-4 py-2 font-medium">הערכה</th>
                          <th className="px-4 py-2 font-medium">משקל</th>
                          <th className="px-4 py-2 font-medium">ציון</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.perAssessment.map((pa) => (
                          <tr key={pa.assessment.id}>
                            <td className="px-4 py-2 text-slate-700">{pa.assessment.title}</td>
                            <td className="px-4 py-2 text-slate-500">{Number(pa.assessment.weight)}%</td>
                            <td className="px-4 py-2 font-medium text-slate-900">{formatGrade(pa.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="px-4 py-3 text-xs text-slate-400">אין הערכות מפורסמות במקצוע זה.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400">
            תעודה זו הופקה אוטומטית על ידי מערכת GradeFlow ואינה מהווה מסמך רשמי ללא חתימה וחותמת בית הספר.
          </footer>
        </CardBody>
      </Card>
    </div>
  );
}
