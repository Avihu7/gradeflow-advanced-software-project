import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { assessmentRepository } from "@/repositories/assessment.repository";
import { assessmentService } from "@/services/assessment.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { AssessmentForm } from "../../AssessmentForm";
import { updateAssessmentAction } from "../../actions";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "עריכת הערכה | GradeFlow" };

export default async function EditAssessmentPage({
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

  const assessment = await assessmentRepository.findInCourse(assessmentId, id);
  if (!assessment) notFound();

  const totalWeight = await assessmentService.totalWeight(id);
  const otherAssessmentsWeight = totalWeight - Number(assessment.weight);

  const boundAction = updateAssessmentAction.bind(null, id, assessmentId);

  return (
    <div>
      <PageHeader title="עריכת הערכה" description={`${course.name} · ${assessment.title}`} />
      <Card className="max-w-xl">
        <CardBody>
          <AssessmentForm
            action={boundAction}
            assessment={assessment}
            currentTotalWeight={otherAssessmentsWeight}
            submitLabel="שמירת שינויים"
          />
        </CardBody>
      </Card>
    </div>
  );
}
