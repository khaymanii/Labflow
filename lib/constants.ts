import type { Role, SampleStatus } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  INTERN: "Laboratory Intern",
  SCIENTIST: "Laboratory Scientist",
  DISPATCH: "Dispatch Staff",
  ADMIN: "Supervisor / Admin",
};

export const ROLE_SHORT_LABELS: Record<Role, string> = {
  INTERN: "Intern",
  SCIENTIST: "Scientist",
  DISPATCH: "Dispatch",
  ADMIN: "Admin",
};

export const STATUS_LABELS: Record<SampleStatus, string> = {
  REGISTERED: "Registered",
  PROCESSING: "Processing",
  RESULT_PRODUCED: "Result Produced",
  AWAITING_DISPATCH: "Awaiting Dispatch",
  RECEIVED_AT_DISPATCH: "Received at Dispatch",
  COLLECTED: "Collected",
};

export const STATUS_DESCRIPTIONS: Record<SampleStatus, string> = {
  REGISTERED: "Sample has been logged into the laboratory workflow.",
  PROCESSING: "Sample is actively being processed by the laboratory.",
  RESULT_PRODUCED: "A result has been produced and is ready to move to dispatch.",
  AWAITING_DISPATCH: "Result is waiting to be handed over to dispatch staff.",
  RECEIVED_AT_DISPATCH: "Dispatch has acknowledged receipt and the result is ready for collection.",
  COLLECTED: "Result has been collected. The workflow is complete.",
};

export const STATUS_ORDER: SampleStatus[] = [
  "REGISTERED",
  "PROCESSING",
  "RESULT_PRODUCED",
  "AWAITING_DISPATCH",
  "RECEIVED_AT_DISPATCH",
  "COLLECTED",
];

export const SAMPLE_TYPES = [
  "Whole Blood (EDTA)",
  "Whole Blood (Plain)",
  "Serum",
  "Plasma",
  "Urine",
  "Stool",
  "Sputum",
  "Swab",
  "Other",
] as const;

export const REQUESTED_TESTS = [
  "Full Blood Count",
  "Malaria Parasite",
  "Blood Glucose",
  "Lipid Profile",
  "Liver Function Test",
  "Renal Function Test",
  "Urinalysis",
  "Widal Test",
  "Blood Group & Genotype",
  "HIV Screening",
  "Hepatitis B Surface Antigen",
  "Hepatitis C Antibody",
  "Culture & Sensitivity",
  "Stool Microscopy",
  "Pregnancy Test (hCG)",
  "Other",
] as const;

export const SAMPLE_PAGE_SIZE = 12;
export const DISPATCH_HISTORY_LIMIT = 25;

export const ALL_ROLES: Role[] = ["INTERN", "SCIENTIST", "DISPATCH", "ADMIN"];
