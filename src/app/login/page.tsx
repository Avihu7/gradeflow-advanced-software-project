import { GraduationCap } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { redirectIfAuthenticated } from "./actions";

export const metadata = {
  title: "התחברות | GradeFlow",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">GradeFlow</h1>
          <p className="text-sm text-slate-500">מערכת לניהול מודול הערכה בית ספרי</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">התחברות למערכת</h2>
          <LoginForm />
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white/60 p-4 text-xs text-slate-500">
          <p className="mb-1.5 font-semibold text-slate-600">משתמשי הדגמה:</p>
          <p>מנהל מערכת: admin@gradeflow.school / Admin123!</p>
          <p>מורה: dana.levi@gradeflow.school / Teacher123!</p>
        </div>
      </div>
    </main>
  );
}
