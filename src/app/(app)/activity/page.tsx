import { getActionLog } from "@/lib/data";
import ActivityLog from "@/components/activity/ActivityLog";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const entries = await getActionLog(60);
  return <ActivityLog entries={entries} />;
}
