import { getIncidents, getCohorts, getActionLog } from "@/lib/data";
import { getSessionProfile } from "@/lib/session";
import QueueView from "@/components/queue/QueueView";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const [incidents, cohorts, audit, profile] = await Promise.all([
    getIncidents(),
    getCohorts(),
    getActionLog(100),
    getSessionProfile(),
  ]);
  return (
    <QueueView
      incidents={incidents}
      cohorts={cohorts}
      audit={audit}
      actorName={profile?.full_name ?? "Ops"}
    />
  );
}
