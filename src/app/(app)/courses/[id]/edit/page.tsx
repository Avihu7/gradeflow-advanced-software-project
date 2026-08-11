import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { courseRepository } from "@/repositories/course.repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { CourseForm } from "../../CourseForm";
import { updateCourseAction } from "../../actions";

export const metadata = { title: "עריכת מקצוע | GradeFlow" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const course = await courseRepository.findById(id);
  if (!course) notFound();

  const boundAction = updateCourseAction.bind(null, id);

  return (
    <div>
      <PageHeader title="עריכת מקצוע" description={course.name} />
      <Card className="max-w-xl">
        <CardBody>
          <CourseForm action={boundAction} course={course} submitLabel="שמירת שינויים" />
        </CardBody>
      </Card>
    </div>
  );
}
