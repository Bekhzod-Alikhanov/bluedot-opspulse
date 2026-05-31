import { getIncidents } from "@/lib/data";
import FinanceAuditor from "@/components/finance/FinanceAuditor";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const incidents = await getIncidents();
  const invoice = incidents.find((i) => i.id === "INC-2047");
  const halted = invoice ? invoice.status === "Resolved" : false;
  return <FinanceAuditor halted={halted} />;
}
