import { getCohorts } from "@/lib/data";
import CohortTriage from "@/components/triage/CohortTriage";

export const dynamic = "force-dynamic";

export default async function TriagePage() {
  const cohorts = await getCohorts();
  return <CohortTriage cohorts={cohorts} />;
}
