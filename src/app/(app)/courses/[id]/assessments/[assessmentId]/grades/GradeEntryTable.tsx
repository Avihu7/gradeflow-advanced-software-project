"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormState } from "@/lib/formState";

export interface GradeSheetRow {
  student: { id: string; firstName: string; lastName: string; studentNumber: string };
  grade: { score: number; feedback: string | null } | null;
}

type SaveAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function GradeEntryTable({ rows, action }: { rows: GradeSheetRow[]; action: SaveAction }) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.message ? (
        <Alert tone={state.success ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">תלמיד</th>
              <th className="px-4 py-3 font-medium">מספר תלמיד</th>
              <th className="w-32 px-4 py-3 font-medium">ציון (0–100)</th>
              <th className="px-4 py-3 font-medium">הערה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map(({ student, grade }) => (
              <tr key={student.id}>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{student.studentNumber}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    name={`score__${student.id}`}
                    min={0}
                    max={100}
                    step={0.5}
                    defaultValue={grade?.score !== undefined && grade?.score !== null ? String(grade.score) : ""}
                    placeholder="—"
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="text"
                    name={`feedback__${student.id}`}
                    defaultValue={grade?.feedback ?? ""}
                    placeholder="הערה אופציונלית"
                    className="w-full min-w-40 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="שומר ציונים...">שמירת כל הציונים</SubmitButton>
        <p className="text-xs text-slate-500">ניתן להשאיר שדה ציון ריק כדי לסמן שהציון טרם הוזן.</p>
      </div>
    </form>
  );
}
