// Static (dramatized) root-cause breakdown for the Notion invoice anomaly.
export const invoiceAudit = {
  invoiceNo: "#20451",
  vendor: "Notion Enterprise",
  lastYear: 4800,
  thisYear: 48000,
  delta: 43200,
  multiplier: 10,
  rootCause:
    "An unmonitored domain-capture setting auto-provisioned premium Enterprise seats for everyone who signed up with an email on BlueDot's verified domains — including 215 external course applicants who created workspaces during R4 admissions.",
  breakdown: [
    { label: "Genuine team seats (last year baseline)", seats: 32, unit: 150, amount: 4800 },
    { label: "Auto-provisioned external applicant seats", seats: 215, unit: 200, amount: 43000 },
    { label: "Proration & tax adjustment", seats: 0, unit: 0, amount: 200 },
  ],
  totalSeats: 247,
  recommendation:
    "Halt auto-pay, disable domain capture, reclaim the 215 phantom seats, and request a corrected invoice (~$4,800-6,000).",
};
