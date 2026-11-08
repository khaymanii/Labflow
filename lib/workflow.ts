import { Role, SampleStatus } from "@prisma/client";

export type WorkflowTransitionDefinition = {
  from: SampleStatus;
  to: SampleStatus;
  action: string;
  shortAction: string;
  description: string;
  notePlaceholder: string;
  allowedRoles: Role[];
  requiresConfirmation: boolean;
};

/**
 * The single source of truth for the laboratory workflow.
 * Route handlers and UI actions both read permissions from this map.
 */
export const WORKFLOW_TRANSITIONS: WorkflowTransitionDefinition[] = [
  {
    from: "REGISTERED",
    to: "PROCESSING",
    action: "Start processing",
    shortAction: "Start processing",
    description: "Move this sample into active laboratory processing.",
    notePlaceholder: "Optional note, e.g. sample checked and accepted",
    allowedRoles: ["INTERN", "SCIENTIST", "ADMIN"],
    requiresConfirmation: false,
  },
  {
    from: "PROCESSING",
    to: "RESULT_PRODUCED",
    action: "Mark result as produced",
    shortAction: "Mark result produced",
    description: "Record that a result has been produced for this sample.",
    notePlaceholder: "Optional note for the laboratory record",
    allowedRoles: ["SCIENTIST", "ADMIN"],
    requiresConfirmation: true,
  },
  {
    from: "RESULT_PRODUCED",
    to: "AWAITING_DISPATCH",
    action: "Send result to dispatch",
    shortAction: "Send to dispatch",
    description: "Hand the result over to the dispatch queue.",
    notePlaceholder: "Optional note, e.g. result checked and released",
    allowedRoles: ["INTERN", "SCIENTIST", "ADMIN"],
    requiresConfirmation: true,
  },
  {
    from: "AWAITING_DISPATCH",
    to: "RECEIVED_AT_DISPATCH",
    action: "Acknowledge receipt at dispatch",
    shortAction: "Acknowledge receipt",
    description:
      "Confirm that dispatch has physically received this result. This creates a handover record.",
    notePlaceholder: "Optional handover note",
    allowedRoles: ["DISPATCH", "ADMIN"],
    requiresConfirmation: true,
  },
  {
    from: "RECEIVED_AT_DISPATCH",
    to: "COLLECTED",
    action: "Record result collection",
    shortAction: "Record collection",
    description:
      "Confirm that the patient has collected the result. This closes the workflow.",
    notePlaceholder: "Optional note, e.g. collected by patient",
    allowedRoles: ["DISPATCH", "ADMIN"],
    requiresConfirmation: true,
  },
];

export function getTransition(
  from: SampleStatus,
  to: SampleStatus,
): WorkflowTransitionDefinition | undefined {
  return WORKFLOW_TRANSITIONS.find(
    (transition) => transition.from === from && transition.to === to,
  );
}

export function getNextTransitions(from: SampleStatus) {
  return WORKFLOW_TRANSITIONS.filter((transition) => transition.from === from);
}

export function canPerformTransition(
  transition: WorkflowTransitionDefinition,
  role: Role,
) {
  return transition.allowedRoles.includes(role);
}

export function getAvailableTransitions(status: SampleStatus, role: Role) {
  return getNextTransitions(status).filter((transition) =>
    canPerformTransition(transition, role),
  );
}
