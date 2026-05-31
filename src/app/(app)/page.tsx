import { getCohorts, getIncidents, getAlerts } from "@/lib/data";
import ControlRoom from "@/components/control/ControlRoom";

export const dynamic = "force-dynamic";

export default async function ControlRoomPage() {
  const [cohorts, incidents, alerts] = await Promise.all([
    getCohorts(),
    getIncidents(),
    getAlerts(),
  ]);
  return <ControlRoom cohorts={cohorts} incidents={incidents} alerts={alerts} />;
}
