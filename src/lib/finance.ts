// Static demo audit for the Notion invoice anomaly. This is a working hypothesis
// until the vendor/sender and Notion admin export are verified through known channels.
export const invoiceAudit = {
  invoiceNo: "#20451",
  vendor: "Notion Enterprise",
  lastYear: 4800,
  thisYear: 48000,
  delta: 43200,
  multiplier: 10,
  rootCause:
    "Working hypothesis after vendor/admin verification: domain capture may have auto-provisioned premium Enterprise seats for people who signed up with email addresses on BlueDot's verified domains, including 215 external course applicants who created workspaces during R4 admissions.",
  verification: [
    "Pause auto-pay before investigating the invoice thread.",
    "Verify sender/vendor via known Notion admin or saved finance contact before replying.",
    "Export current paid seats and reconcile genuine staff seats against the billed total.",
    "If the seat export confirms the hypothesis, request a corrected invoice and disable domain capture.",
  ],
  breakdown: [
    { label: "Genuine team seats (last year baseline)", seats: 32, unit: 150, amount: 4800 },
    { label: "External applicant seats to verify", seats: 215, unit: 200, amount: 43000 },
    { label: "Proration & tax adjustment", seats: 0, unit: 0, amount: 200 },
  ],
  totalSeats: 247,
  recommendation:
    "Halt auto-pay, verify the vendor/sender through known channels, validate the seat export, then request a corrected invoice if the hypothesis is confirmed.",
};
