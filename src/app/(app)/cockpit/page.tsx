import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getRounds, getRoundMetrics, getCohorts, getRisks, getIncidents } from "@/lib/data";
import Cockpit from "@/components/cockpit/Cockpit";

export const dynamic = "force-dynamic";

export default async function CockpitPage() {
  const profile = await getSessionProfile();
  if (profile?.role !== "management") redirect("/");

  const [rounds, metrics, cohorts, risks, incidents] = await Promise.all([
    getRounds(), getRoundMetrics(), getCohorts(), getRisks(), getIncidents(),
  ]);
  return <Cockpit rounds={rounds} metrics={metrics} cohorts={cohorts} risks={risks} incidents={incidents} />;
}
