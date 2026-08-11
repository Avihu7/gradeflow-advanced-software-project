import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Pencil, BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { studentService } from "@/services/student.service";
import { courseRepository } from "@/repositories/course.repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToggleActiveButton } from "./ToggleActiveButton";
import { NotFoundError } from "@/domain/errors";

export const metadata = { title: "פרטי תלמיד | GradeFlow" };

export default async function StudentDetailPage({
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

  const courses = await courseRepository.findManyForStudent(id);

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={`מספר תלמיד ${student.studentNumber} · כיתה ${student.className}`}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/reports/student/${student.id}`} variant="secondary" size="sm">
              תעודה
            </LinkButton>
            <LinkButton href={`/students/${student.id}/edit`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              עריכה
            </LinkButton>
            <ToggleActiveButton studentId={student.id} active={student.active} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="פרטים" />
          <CardBody className="flex flex-col gap-3 text-sm">
            <Row label="שם מלא" value={`${student.firstName} ${student.lastName}`} />
            <Row label="מספר תלמיד" value={student.studentNumber} />
            <Row label="כיתה" value={student.className} />
            <Row label="אימייל" value={student.email ?? "—"} />
            <Row
              label="סטטוס"
              value={student.active ? <Badge tone="green">פעיל</Badge> : <Badge tone="slate">לא פעיל</Badge>}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="מקצועות רשומים" description={`${courses.length} מקצועות`} />
          <CardBody>
            {courses.length === 0 ? (
              <EmptyState icon={BookOpen} title="התלמיד אינו רשום למקצועות" />
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {courses.map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.id}`}
                      className="block rounded-lg border border-slate-200 p-3 hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <p className="font-medium text-slate-900">{course.name}</p>
                      <p className="text-xs text-slate-500">{course.code} · {course.schoolYear}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
