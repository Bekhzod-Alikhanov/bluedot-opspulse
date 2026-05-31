import { getTemplates } from "@/lib/data";
import TemplatesView from "@/components/templates/TemplatesView";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();
  return <TemplatesView templates={templates} />;
}
