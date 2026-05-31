import { getBackups } from "@/lib/data";
import BackupMatcher from "@/components/backup/BackupMatcher";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  const backups = await getBackups();
  return <BackupMatcher backups={backups} />;
}
