import { getIncidents } from "@/lib/data";
import { getSessionProfile } from "@/lib/session";
import QueueView from "@/components/queue/QueueView";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const [incidents, profile] = await Promise.all([getIncidents(), getSessionProfile()]);
  return <QueueView incidents={incidents} actorName={profile?.full_name ?? "Ops"} />;
}
