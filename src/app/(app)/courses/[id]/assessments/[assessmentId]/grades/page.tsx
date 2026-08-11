import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { gradeService } from "@/services/grade.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { assessmentTypeLabels } from "@/validation/assessment.schema";
import { GradeEntryTable } from "./GradeEntryTable";
import { saveGradeSheetAction } from "./actions";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "הזנת ציונים | GradeFlow" };

export default async function GradeEntryPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const user = await requireUser();
  const { id, assessmentId } = await params;

  const course = await courseService.getByIdForActor(user, id).catch((error) => {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!course) notFound();

  const sheet = await gradeService.getGradeSheet(id, assessmentId).catch((error) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });
  if (!sheet) notFound();

  const rows = sheet.rows.map((row) => ({
    student: {
      id: row.student.id,
      firstName: row.student.firstName,
      lastName: row.student.lastName,
      studentNumber: row.student.studentNumber,
    },
    grade: row.grade ? { score: Number(row.grade.score), feedback: row.grade.feedback } : null,
  }));

  const studentIds = rows.map((r) => r.student.id);
  const boundAction = saveGradeSheetAction.bind(null, id, assessmentId, studentIds);

  return (
    <div>
      <PageHeader
        title={`הזנת ציונים · ${sheet.assessment.title}`}
        description={`${course.name} · ${assessmentTypeLabels[sheet.assessment.type]} · משקל ${Number(sheet.assessment.weight)}%`}
      />

      <Card>
        <CardBody>
          {rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="אין תלמידים רשומים למקצוע"
              description="יש לרשום תלמידים למקצוע לפני הזנת ציונים."
            />
          ) : (
            <GradeEntryTable rows={rows} action={boundAction} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
