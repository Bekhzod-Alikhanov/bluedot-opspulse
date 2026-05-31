"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import {
  initialCohorts,
  initialIncidents,
  initialBackups,
  type Cohort,
  type Incident,
  type BackupFacilitator,
  type ShiftGap,
} from "./data/mockData";
import Sidebar, { type ViewKey } from "./components/Sidebar";
import ControlRoom from "./components/ControlRoom";
import CohortTriage from "./components/CohortTriage";
import BackupMatcher from "./components/BackupMatcher";
import FinanceAuditor from "./components/FinanceAuditor";

export interface Toast {
  id: number;
  message: string;
  detail?: string;
}

export interface OpsState {
  cohorts: Cohort[];
  incidents: Incident[];
  backups: BackupFacilitator[];
  systemHealth: number;
  criticalAlerts: number;
  pendingInvoices: number;
  openIncidents: Incident[];
  invoiceHalted: boolean;
}

export default function Page() {
  const [cohorts, setCohorts] = useState<Cohort[]>(initialCohorts);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [backups, setBackups] = useState<BackupFacilitator[]>(initialBackups);
  const [invoiceHalted, setInvoiceHalted] = useState(false);
  const [activeView, setActiveView] = useState<ViewKey>("control");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---- Derived metrics (recompute on every state change) -------------------
  const openIncidents = useMemo(
    () => incidents.filter((i) => i.status === "Open"),
    [incidents]
  );

  const systemHealth = useMemo(() => {
    const deduction = openIncidents.reduce((sum, i) => sum + i.healthImpact, 0);
    return Math.max(0, Math.min(100, 100 - deduction));
  }, [openIncidents]);

  const criticalAlerts = useMemo(
    () =>
      openIncidents.filter((i) => i.priority === "P0" || i.priority === "P1")
        .length,
    [openIncidents]
  );

  const pendingInvoices = useMemo(
    () =>
      incidents.filter(
        (i) => i.cohortId === null && i.status === "Open"
      ).length,
    [incidents]
  );

  // ---- Toast helpers -------------------------------------------------------
  const pushToast = useCallback((message: string, detail?: string) => {
    setToasts((prev) => {
      const id = (prev[prev.length - 1]?.id ?? 0) + 1;
      return [...prev, { id, message, detail }];
    });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4200);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ---- Mutators (the spine: actions reshape global state) ------------------
  const resolveIncidents = useCallback((ids: string[]) => {
    setIncidents((prev) =>
      prev.map((i) =>
        ids.includes(i.id) ? { ...i, status: "Resolved" } : i
      )
    );
  }, []);

  const stabilizeCohort11 = useCallback(() => {
    setCohorts((prev) =>
      prev.map((c) =>
        c.id === 11
          ? {
              ...c,
              risk: "Green",
              stabilized: true,
              headline:
                "STABILIZED: Jamie suspended pending review, UK backup deploying for Friday, written response drafted for Sarah Chen.",
            }
          : c
      )
    );
    resolveIncidents(["INC-2041", "INC-2045", "INC-2039"]);
    pushToast(
      "Cohort 11 stabilized",
      "Jamie suspended · P0 cleared · backup queued for Friday 4-6pm"
    );
  }, [resolveIncidents, pushToast]);

  const remedyOnboarding12 = useCallback(() => {
    setCohorts((prev) =>
      prev.map((c) =>
        c.id === 12
          ? {
              ...c,
              risk: "Amber",
              onboardingStatus: "Manually Remedied",
              emailDeliveryPct: 100,
              transferRequests: 2,
              headline:
                "Welcome pack manually sent to all 12. Transfer requests being worked 1:1; automation retro scheduled.",
            }
          : c
      )
    );
    resolveIncidents(["INC-2042"]);
    pushToast(
      "Cohort 12 onboarding remedied",
      "12/12 welcome packs sent manually · ticket resolved"
    );
  }, [resolveIncidents, pushToast]);

  const assignBackup = useCallback(
    (backup: BackupFacilitator, gap: ShiftGap) => {
      setBackups((prev) =>
        prev.map((b) => (b.id === backup.id ? { ...b, status: "Busy" } : b))
      );
      setCohorts((prev) =>
        prev.map((c) =>
          c.id === gap.cohortId
            ? {
                ...c,
                risk: c.id === 10 ? "Green" : c.risk,
                headline:
                  c.id === 10
                    ? `Cover confirmed: ${backup.name} runs Thursday 6-8pm. Tom to brief.`
                    : c.headline,
              }
            : c
        )
      );
      resolveIncidents(gap.cohortId === 10 ? [gap.incidentId] : []);
      pushToast(
        `${backup.name} assigned to ${gap.label}`,
        `Booked at £${backup.costPerSession}/session · Slack alert sent`
      );
    },
    [resolveIncidents, pushToast]
  );

  const haltAutoPay = useCallback(() => {
    setInvoiceHalted(true);
    resolveIncidents(["INC-2047"]);
    pushToast(
      "Auto-pay halted · escalation sent",
      "Notion invoice frozen · message copied for Li-Lian"
    );
  }, [resolveIncidents, pushToast]);

  const state: OpsState = {
    cohorts,
    incidents,
    backups,
    systemHealth,
    criticalAlerts,
    pendingInvoices,
    openIncidents,
    invoiceHalted,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        systemHealth={systemHealth}
        criticalAlerts={criticalAlerts}
      />

      <main className="relative flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10">
          {activeView === "control" && (
            <ControlRoom state={state} onNavigate={setActiveView} />
          )}
          {activeView === "triage" && (
            <CohortTriage
              state={state}
              onStabilizeC11={stabilizeCohort11}
              onRemedyC12={remedyOnboarding12}
            />
          )}
          {activeView === "backup" && (
            <BackupMatcher state={state} onAssign={assignBackup} />
          )}
          {activeView === "finance" && (
            <FinanceAuditor state={state} onHalt={haltAutoPay} />
          )}
        </div>

        {/* Toast stack */}
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[360px] flex-col gap-3">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="panel pointer-events-auto animate-slide-in rounded-xl border-emerald-500/30 p-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-100">
                    {t.message}
                  </p>
                  {t.detail && (
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      {t.detail}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(t.id)}
                  className="text-slate-500 transition hover:text-slate-300"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
