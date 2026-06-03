import {
  Radar, Inbox, LayoutGrid, CalendarClock, ReceiptText, BellRing, BarChart3,
  FileText, History, ClipboardCheck,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  sub: string;
  icon: typeof Radar;
  roles: Role[];
}

export const NAV: NavItem[] = [
  { href: "/", label: "Control Room", sub: "Overview", icon: Radar, roles: ["ops", "management"] },
  { href: "/queue", label: "Triage Queue", sub: "Live inbox", icon: Inbox, roles: ["ops"] },
  { href: "/triage", label: "Cohort Triage", sub: "6 cohorts", icon: LayoutGrid, roles: ["ops"] },
  { href: "/backup", label: "Backup Matcher", sub: "Scheduling", icon: CalendarClock, roles: ["ops"] },
  { href: "/finance", label: "Financial Hygiene", sub: "Invoice audit", icon: ReceiptText, roles: ["ops"] },
  { href: "/alerts", label: "Monitors & Alerts", sub: "Prevention", icon: BellRing, roles: ["ops", "management"] },
  { href: "/systemic", label: "Systemic Fix", sub: "Health sweep", icon: ClipboardCheck, roles: ["ops", "management"] },
  { href: "/cockpit", label: "Leadership Cockpit", sub: "Trends & risk", icon: BarChart3, roles: ["management"] },
  { href: "/activity", label: "Activity Log", sub: "Audit trail", icon: History, roles: ["ops", "management"] },
  { href: "/templates", label: "Drafts Shipped", sub: "Comms", icon: FileText, roles: ["ops", "management"] },
];

export function healthTone(h: number) {
  if (h >= 85) return { text: "text-emerald-300", bar: "bg-emerald-400", ring: "border-emerald-500/40", label: "Nominal" };
  if (h >= 60) return { text: "text-amber-300", bar: "bg-amber-400", ring: "border-amber-500/40", label: "Action Required" };
  return { text: "text-rose-300", bar: "bg-rose-400", ring: "border-rose-500/40", label: "Critical" };
}

export function navFor(role: Role) {
  return NAV.filter((n) => n.roles.includes(role));
}
