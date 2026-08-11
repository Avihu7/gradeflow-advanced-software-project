import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { studentService } from "@/services/student.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { StudentForm } from "../../StudentForm";
import { updateStudentAction } from "../../actions";
import { NotFoundError } from "@/domain/errors";

export const metadata = { title: "עריכת תלמיד | GradeFlow" };

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const student = await studentService.getById(id).catch((error) => {
    if (error instanceof NotFoundError) return null;
    throw error;
  });

  if (!student) notFound();

  const boundAction = updateStudentAction.bind(null, id);

  return (
    <div>
      <PageHeader title="עריכת תלמיד" description={`${student.firstName} ${student.lastName}`} />
      <Card className="max-w-xl">
        <CardBody>
          <StudentForm action={boundAction} student={student} submitLabel="שמירת שינויים" />
        </CardBody>
      </Card>
    </div>
  );
}
