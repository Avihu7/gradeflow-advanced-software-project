import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Shell for every authenticated screen. `requireUser()` runs on the
 * server for every request to a route under this layout and redirects
 * to /login if there is no valid session - this is the primary
 * server-side authentication gate (route protection does not rely on
 * client-side checks).
 *
 * Only plain, serializable data (id/name/email/role) is passed down to
 * the `AppShell` Client Component - it resolves its own nav items (which
 * carry Lucide icon component references) internally, since component
 * references cannot cross the Server -> Client boundary as props.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
