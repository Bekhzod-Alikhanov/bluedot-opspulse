import { getMonitors, getAlerts } from "@/lib/data";
import AlertsView from "@/components/alerts/AlertsView";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const [monitors, alerts] = await Promise.all([getMonitors(), getAlerts()]);
  return <AlertsView monitors={monitors} alerts={alerts} />;
}
