"use client";

import { useRef } from "react";
import { Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function AssignTeacherForm({
  action,
  teachers,
}: {
  action: (formData: FormData) => Promise<void>;
  teachers: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (teachers.length === 0) {
    return <p className="text-sm text-slate-500">כל המורים כבר משויכים למקצוע זה.</p>;
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
        <Select name="teacherId" required defaultValue="">
          <option value="" disabled>
            בחירת מורה לשיוך...
          </option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton variant="secondary" size="sm" pendingLabel="משייך...">
        שיוך
      </SubmitButton>
    </form>
  );
}
