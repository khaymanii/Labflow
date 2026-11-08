import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Inbox,
  Send,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { SampleProgress } from "@/components/samples/sample-progress";
import { SampleTimeline } from "@/components/samples/timeline";
import {
  WorkflowActions,
  type ActionTransition,
} from "@/components/samples/workflow-actions";
import { getSampleById } from "@/lib/data/samples";
import { getCurrentUser, requireUser } from "@/lib/auth-guards";
import { getAvailableTransitions, getNextTransitions } from "@/lib/workflow";
import {
  ROLE_LABELS,
  STATUS_DESCRIPTIONS,
  ROLE_SHORT_LABELS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SampleDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
};

export default async function SampleDetailPage({
  params,
  searchParams,
}: SampleDetailPageProps) {
  const sessionUser = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const sample = await getSampleById(id);

  if (!sample) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const role = currentUser?.role ?? sessionUser.role;
  const availableTransitions = getAvailableTransitions(sample.status, role);
  const transitions: ActionTransition[] = availableTransitions.map((transition) => ({
    from: transition.from,
    to: transition.to,
    action: transition.action,
    shortAction: transition.shortAction,
    description: transition.description,
    notePlaceholder: transition.notePlaceholder,
  }));

  const latestEvent = sample.workflowEvents.at(-1);
  const nextSteps = getNextTransitions(sample.status);
  const created = Array.isArray(query.created) ? query.created[0] : query.created;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 text-muted-foreground">
          <Link href="/samples">
            <ArrowLeft className="h-4 w-4" />
            Back to samples
          </Link>
        </Button>
        <PageHeader
          eyebrow={`Accession ${sample.accessionNumber}`}
          title={sample.patientName ?? "Patient name not recorded"}
          description={`${sample.requestedTest} · ${sample.sampleType} · ${sample.department.name}`}
          actions={<StatusBadge status={sample.status} className="px-3 py-1 text-sm" />}
        />
      </div>

      {created ? (
        <Alert variant="success">
          <AlertDescription>
            <span className="font-medium">Sample registered successfully.</span>{" "}
            Accession number {sample.accessionNumber} is now in the workflow.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Workflow progress</CardTitle>
          <CardDescription>{STATUS_DESCRIPTIONS[sample.status]}</CardDescription>
        </CardHeader>
        <CardContent>
          <SampleProgress status={sample.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Sample details</CardTitle>
                <CardDescription>
                  Identifying information recorded at registration.
                </CardDescription>
              </div>
              <Badge variant="neutral" className="font-mono">
                {sample.accessionNumber}
              </Badge>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <Detail label="Patient identifier" value={sample.patientIdentifier} />
                <Detail label="Patient name" value={sample.patientName ?? "Not recorded"} />
                <Detail label="Sample type" value={sample.sampleType} />
                <Detail label="Requested test" value={sample.requestedTest} />
                <Detail label="Department" value={sample.department.name} />
                <Detail label="Registered by" value={sample.registeredBy.name} />
                <Detail label="Registered at" value={formatDateTime(sample.createdAt)} />
                <Detail label="Last updated" value={formatDateTime(sample.updatedAt)} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow actions</CardTitle>
              <CardDescription>
                Available actions for your role at the current stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transitions.length > 0 ? (
                <WorkflowActions sampleId={sample.id} transitions={transitions} />
              ) : sample.status === "COLLECTED" ? (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      Workflow complete
                    </p>
                    <p className="text-sm text-emerald-800">
                      This result has been collected. No further workflow actions are
                      available.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    No action available for your role
                  </p>
                  <p className="mt-1">
                    {nextSteps.length > 0
                      ? `The next step is "${nextSteps[0].shortAction.toLowerCase()}". Allowed roles: ${nextSteps[0].allowedRoles
                          .map((nextRole) => ROLE_LABELS[nextRole])
                          .join(", ")}.`
                      : "No further workflow step is defined."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow history</CardTitle>
              <CardDescription>
                Immutable audit trail of every status change for this sample.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SampleTimeline events={sample.workflowEvents} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Current status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusBadge status={sample.status} className="px-3 py-1 text-sm" />
              <p className="text-sm text-muted-foreground">
                {STATUS_DESCRIPTIONS[sample.status]}
              </p>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Current responsible staff
                    </p>
                    <p className="text-sm font-medium">
                      {latestEvent?.performedBy.name ?? sample.registeredBy.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {latestEvent
                        ? ROLE_LABELS[latestEvent.performedBy.role]
                        : "Registration staff"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Last updated
                    </p>
                    <p className="text-sm">
                      {formatDateTime(latestEvent?.createdAt ?? sample.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Registered
                    </p>
                    <p className="text-sm">{formatDateTime(sample.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Dispatch handover
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sample.dispatchRecord ? (
                <div className="space-y-3 text-sm">
                  <HandoverRow
                    label="Handed over by"
                    value={sample.dispatchRecord.handedOverBy.name}
                    meta={`${ROLE_SHORT_LABELS[sample.dispatchRecord.handedOverBy.role]} · ${formatDateTime(sample.dispatchRecord.dispatchedAt)}`}
                  />
                  <HandoverRow
                    label="Received by"
                    value={sample.dispatchRecord.receivedBy.name}
                    meta={`${formatDateTime(sample.dispatchRecord.receivedAt)}`}
                  />
                  {sample.dispatchRecord.collectedAt &&
                  sample.dispatchRecord.collectedBy ? (
                    <HandoverRow
                      label="Collected by staff"
                      value={sample.dispatchRecord.collectedBy.name}
                      meta={formatDateTime(sample.dispatchRecord.collectedAt)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
                      <Inbox className="h-4 w-4" />
                      Awaiting patient collection
                    </div>
                  )}
                  {sample.dispatchRecord.notes ? (
                    <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      {sample.dispatchRecord.notes}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    No handover recorded yet. A dispatch record is created when
                    dispatch staff acknowledge receipt.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>Sample ID</span>
                <span className="font-mono text-foreground">{sample.id.slice(-10)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Department</span>
                <span className="text-foreground">{sample.department.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Events recorded</span>
                <span className="text-foreground">{sample.workflowEvents.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Created</span>
                <span className="text-foreground">{formatDateTime(sample.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

function HandoverRow({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}
