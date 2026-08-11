import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { assessmentService } from "@/services/assessment.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { AssessmentForm } from "../AssessmentForm";
import { createAssessmentAction } from "../actions";
import { ForbiddenError, NotFoundError } from "@/domain/errors";

export const metadata = { title: "הערכה חדשה | GradeFlow" };

export default async function NewAssessmentPage({
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

  const totalWeight = await assessmentService.totalWeight(id);
  const boundAction = createAssessmentAction.bind(null, id);

  return (
    <div>
      <PageHeader title="הערכה חדשה" description={course.name} />
      <Card className="max-w-xl">
        <CardBody>
          <AssessmentForm
            action={boundAction}
            currentTotalWeight={totalWeight}
            submitLabel="יצירת הערכה"
          />
        </CardBody>
      </Card>
    </div>
  );
}
