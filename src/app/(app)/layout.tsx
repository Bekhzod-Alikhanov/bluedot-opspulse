import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getIncidents } from "@/lib/data";
import { computeHealth, criticalCount } from "@/lib/sla";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const incidents = await getIncidents();
  const health = computeHealth(incidents);
  const critical = criticalCount(incidents);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile.role}
        name={profile.full_name}
        email={profile.email}
        systemHealth={health}
        criticalAlerts={critical}
      />
      <main className="relative flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1320px] px-5 py-7 lg:px-9">{children}</div>
      </main>
    </div>
  );
}
