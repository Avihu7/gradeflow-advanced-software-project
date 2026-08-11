import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { StudentForm } from "../StudentForm";
import { createStudentAction } from "../actions";

export const metadata = { title: "תלמיד חדש | GradeFlow" };

export default async function NewStudentPage() {
  await requireRole("ADMIN");

  return (
    <div>
      <PageHeader title="תלמיד חדש" description="הוספת תלמיד חדש למערכת" />
      <Card className="max-w-xl">
        <CardBody>
          <StudentForm action={createStudentAction} submitLabel="יצירת תלמיד" />
        </CardBody>
      </Card>
    </div>
  );
}
