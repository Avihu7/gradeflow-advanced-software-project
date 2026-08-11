import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { CourseForm } from "../CourseForm";
import { createCourseAction } from "../actions";

export const metadata = { title: "מקצוע חדש | GradeFlow" };

export default async function NewCoursePage() {
  await requireRole("ADMIN");

  return (
    <div>
      <PageHeader title="מקצוע חדש" description="הוספת מקצוע חדש למערכת" />
      <Card className="max-w-xl">
        <CardBody>
          <CourseForm action={createCourseAction} submitLabel="יצירת מקצוע" />
        </CardBody>
      </Card>
    </div>
  );
}
