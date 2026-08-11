import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const roleLabels: Record<string, string> = {
  ADMIN: "מנהל מערכת",
  TEACHER: "מורה",
};

export const metadata = { title: "הגדרות | GradeFlow" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div>
      <PageHeader title="הגדרות" description="פרטי המשתמש המחובר למערכת" />

      <Card className="max-w-lg">
        <CardHeader title="פרופיל אישי" />
        <CardBody className="flex flex-col gap-4">
          <Row label="שם מלא" value={user.name} />
          <Row label="אימייל" value={user.email} />
          <Row label="תפקיד" value={<Badge tone="brand">{roleLabels[user.role] ?? user.role}</Badge>} />
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
