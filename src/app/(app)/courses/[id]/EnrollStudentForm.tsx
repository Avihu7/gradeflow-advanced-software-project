"use client";

import { useRef } from "react";
import { Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function EnrollStudentForm({
  action,
  students,
}: {
  action: (formData: FormData) => Promise<void>;
  students: { id: string; firstName: string; lastName: string; studentNumber: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (students.length === 0) {
    return <p className="text-sm text-slate-500">כל התלמידים הפעילים כבר רשומים למקצוע זה.</p>;
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex items-end gap-2"
    >
      <div className="flex-1">
        <Select name="studentId" required defaultValue="">
          <option value="" disabled>
            בחירת תלמיד לרישום...
          </option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName} ({student.studentNumber})
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton variant="secondary" size="sm" pendingLabel="נרשם...">
        רישום
      </SubmitButton>
    </form>
  );
}
