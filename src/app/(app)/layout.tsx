import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getIncidents } from "@/lib/data";
import { computeHealth, criticalCount } from "@/lib/sla";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/nav/MobileNav";
import WelcomeTour from "@/components/WelcomeTour";

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

  const navProps = {
    role: profile.role,
    name: profile.full_name,
    email: profile.email,
    systemHealth: health,
    criticalAlerts: critical,
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar {...navProps} />
      <MobileNav {...navProps} />
      <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-x-hidden focus:outline-none">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-5 lg:px-9 lg:py-7">{children}</div>
      </main>
      <WelcomeTour />
    </div>
  );
}
