import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, ClipboardList, Users2, BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { courseService } from "@/services/course.service";
import { assessmentService } from "@/services/assessment.service";
import { studentRepository } from "@/repositories/student.repository";
import { userRepository } from "@/repositories/user.repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionButton } from "@/components/ui/ConfirmActionButton";
import { assessmentTypeLabels } from "@/validation/assessment.schema";
import { formatDate } from "@/lib/utils";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import { AssignTeacherForm } from "./AssignTeacherForm";
import { EnrollStudentForm } from "./EnrollStudentForm";
import {
  assignTeacherAction,
  removeTeacherAction,
  enrollStudentAction,
  unenrollStudentAction,
} from "../actions";
import { DeleteAssessmentButton } from "./assessments/DeleteAssessmentButton";
import { PublishToggleButton } from "./assessments/PublishToggleButton";

export const metadata = { title: "פרטי מקצוע | GradeFlow" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const course = await courseService.getByIdForActor(user, id).catch((error) => {
    if (error instanceof NotFoundError) return null;
    if (error instanceof ForbiddenError) return null;
    throw error;
  });

  if (!course) notFound();

  const [assessments, totalWeight] = await Promise.all([
    assessmentService.listByCourse(id),
    assessmentService.totalWeight(id),
  ]);

  const isAdmin = user.role === "ADMIN";

  const [availableTeachers, availableStudents] = isAdmin
    ? await Promise.all([
        userRepository.findTeachers(),
        studentRepository.findNotEnrolledInCourse(id),
      ])
    : [[], []];

  const assignedTeacherIds = new Set(course.teacherCourses.map((tc) => tc.teacherId));
  const assignableTeachers = availableTeachers.filter((t) => !assignedTeacherIds.has(t.id));

  const boundAssign = assignTeacherAction.bind(null, id);
  const boundEnroll = enrollStudentAction.bind(null, id);

  const publishedWeight = assessments
    .filter((a) => a.published)
    .reduce((sum, a) => sum + Number(a.weight), 0);

  return (
    <div>
      <PageHeader
        title={course.name}
        description={`${course.code} · שנת לימודים ${course.schoolYear}`}
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href={`/courses/${id}/final-grades`} variant="secondary" size="sm">
              <BarChart3 className="h-4 w-4" />
              ציונים סופיים
            </LinkButton>
            <LinkButton href={`/reports/course/${id}`} variant="secondary" size="sm">
              <ClipboardList className="h-4 w-4" />
              דוח מקצוע
            </LinkButton>
            {isAdmin ? (
              <LinkButton href={`/courses/${id}/edit`} variant="secondary" size="sm">
                <Pencil className="h-4 w-4" />
                עריכה
              </LinkButton>
            ) : null}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader title="מורים משויכים" />
            <CardBody className="flex flex-col gap-2">
              {course.teacherCourses.length === 0 ? (
                <p className="text-sm text-slate-500">טרם שויך מורה למקצוע.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {course.teacherCourses.map((tc) => (
                    <li
                      key={tc.teacherId}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-800">{tc.teacher.name}</span>
                      {isAdmin ? (
                        <ConfirmActionButton
                          label="הסרת שיוך"
                          confirmMessage={`להסיר את שיוך ${tc.teacher.name} למקצוע?`}
                          action={removeTeacherAction.bind(null, id, tc.teacherId)}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {isAdmin ? <AssignTeacherForm action={boundAssign} teachers={assignableTeachers} /> : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="תלמידים רשומים"
              description={`${course.enrollments.length} תלמידים`}
            />
            <CardBody className="flex flex-col gap-2">
              {course.enrollments.length === 0 ? (
                <p className="text-sm text-slate-500">אין עדיין תלמידים רשומים.</p>
              ) : (
                <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                  {course.enrollments.map((enrollment) => (
                    <li
                      key={enrollment.studentId}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <Link
                        href={isAdmin ? `/students/${enrollment.student.id}` : "#"}
                        className={isAdmin ? "font-medium text-slate-800 hover:text-brand-600" : "font-medium text-slate-800"}
                      >
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </Link>
                      {isAdmin ? (
                        <ConfirmActionButton
                          label="ביטול רישום"
                          confirmMessage={`לבטל את רישום ${enrollment.student.firstName} ${enrollment.student.lastName} למקצוע?`}
                          action={unenrollStudentAction.bind(null, id, enrollment.studentId)}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {isAdmin ? <EnrollStudentForm action={boundEnroll} students={availableStudents} /> : null}
            </CardBody>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader
            title="הערכות ומבנה הציון"
            description={
              <span>
                סכום משקלים כולל: <strong>{totalWeight}%</strong> · סכום משקלים מפורסמים:{" "}
                <strong className={publishedWeight === 100 ? "text-emerald-600" : "text-amber-600"}>
                  {publishedWeight}%
                </strong>
              </span>
            }
            action={
              <LinkButton href={`/courses/${id}/assessments/new`} size="sm">
                <Plus className="h-4 w-4" />
                הערכה חדשה
              </LinkButton>
            }
          />
          <CardBody className="p-0">
            {assessments.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="אין עדיין הערכות במקצוע זה"
                description="הוסיפו מבחן, בוחן, עבודה או פרויקט כדי להתחיל לבנות את מבנה הציון."
                action={
                  <LinkButton href={`/courses/${id}/assessments/new`} size="sm">
                    הערכה חדשה
                  </LinkButton>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">כותרת</th>
                      <th className="px-4 py-3 font-medium">סוג</th>
                      <th className="px-4 py-3 font-medium">משקל</th>
                      <th className="px-4 py-3 font-medium">תאריך</th>
                      <th className="px-4 py-3 font-medium">סטטוס</th>
                      <th className="px-4 py-3 font-medium">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{assessment.title}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {assessmentTypeLabels[assessment.type]}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{Number(assessment.weight)}%</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(assessment.date)}</td>
                        <td className="px-4 py-3">
                          {assessment.published ? (
                            <Badge tone="green">מפורסם</Badge>
                          ) : (
                            <Badge tone="slate">טיוטה</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <Link
                              href={`/courses/${id}/assessments/${assessment.id}/grades`}
                              className="font-medium text-brand-600 hover:text-brand-700"
                            >
                              הזנת ציונים
                            </Link>
                            <Link
                              href={`/courses/${id}/assessments/${assessment.id}/edit`}
                              className="text-slate-500 hover:text-slate-800"
                            >
                              עריכה
                            </Link>
                            <PublishToggleButton
                              courseId={id}
                              assessmentId={assessment.id}
                              published={assessment.published}
                            />
                            <DeleteAssessmentButton
                              courseId={id}
                              assessmentId={assessment.id}
                              title={assessment.title}
                            />
                          </div>
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

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <Users2 className="h-3.5 w-3.5" />
        עמוד זה נגיש למנהלי המערכת ולמורים המשויכים למקצוע בלבד.
      </div>
    </div>
  );
}
