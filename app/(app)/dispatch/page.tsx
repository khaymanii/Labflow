import Link from "next/link";
import {
  CheckCircle2,
  Inbox,
  PackageCheck,
  Send,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  WorkflowActions,
  type ActionTransition,
} from "@/components/samples/workflow-actions";
import { getCurrentUser, requireUser } from "@/lib/auth-guards";
import { getDispatchData } from "@/lib/data/dispatch";
import { getAvailableTransitions } from "@/lib/workflow";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toActionTransitions(
  status: "AWAITING_DISPATCH" | "RECEIVED_AT_DISPATCH",
  role: Parameters<typeof getAvailableTransitions>[1],
): ActionTransition[] {
  return getAvailableTransitions(status, role).map((transition) => ({
    from: transition.from,
    to: transition.to,
    action: transition.action,
    shortAction: transition.shortAction,
    description: transition.description,
    notePlaceholder: transition.notePlaceholder,
  }));
}

export default async function DispatchPage() {
  const sessionUser = await requireUser();
  const currentUser = await getCurrentUser();
  const role = currentUser?.role ?? sessionUser.role;
  const data = await getDispatchData();

  const receiveActions = toActionTransitions("AWAITING_DISPATCH", role);
  const collectionActions = toActionTransitions("RECEIVED_AT_DISPATCH", role);
  const canReceive = receiveActions.length > 0;
  const canCollect = collectionActions.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch queue"
        description="Track result handovers from the laboratory to dispatch and patient collection."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Awaiting receipt"
          value={data.awaitingDispatch.length}
          icon={Send}
          tone="amber"
          hint="Handed over by the laboratory"
        />
        <StatCard
          label="Ready for collection"
          value={data.awaitingCollection.length}
          icon={Inbox}
          tone="cyan"
          hint="Received and awaiting patient"
        />
        <StatCard
          label="Collected today"
          value={data.collectedToday}
          icon={CheckCircle2}
          tone="primary"
          hint="Closed workflows today"
        />
      </div>

      <Alert variant="info">
        <AlertDescription>
          Dispatch staff must acknowledge each result on receipt. A handover
          record is created at acknowledgement and closed when collection is
          recorded.
        </AlertDescription>
      </Alert>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Results awaiting dispatch
              </CardTitle>
              <CardDescription>
                Laboratory results waiting to be received at dispatch.
              </CardDescription>
            </div>
            <Badge variant="warning">{data.awaitingDispatch.length} waiting</Badge>
          </div>
        </CardHeader>
        {data.awaitingDispatch.length === 0 ? (
          <CardContent className="p-5">
            <EmptyState
              icon={PackageCheck}
              title="No results awaiting dispatch"
              description="Results appear here after laboratory staff send them to dispatch."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Handed over by</TableHead>
                <TableHead>Waiting since</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.awaitingDispatch.map((sample) => {
                const event = sample.workflowEvents[0];
                return (
                  <TableRow key={sample.id}>
                    <TableCell>
                      <Link
                        href={`/samples/${sample.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {sample.accessionNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {sample.patientName ?? "Name not recorded"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sample.patientIdentifier}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{sample.requestedTest}</p>
                      <p className="text-xs text-muted-foreground">
                        {sample.department.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      {event ? (
                        <>
                          <p className="text-sm">{event.performedBy.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {formatDateTime(sample.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {canReceive ? (
                        <div className="flex justify-end [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs">
                          <WorkflowActions
                            sampleId={sample.id}
                            transitions={receiveActions}
                            compact
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Awaiting dispatch staff
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Ready for collection
              </CardTitle>
              <CardDescription>
                Results received at dispatch and awaiting patient collection.
              </CardDescription>
            </div>
            <Badge variant="info">{data.awaitingCollection.length} ready</Badge>
          </div>
        </CardHeader>
        {data.awaitingCollection.length === 0 ? (
          <CardContent className="p-5">
            <EmptyState
              icon={Inbox}
              title="No results ready for collection"
              description="Results appear here once dispatch has acknowledged receipt."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Received by</TableHead>
                <TableHead>Received at</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.awaitingCollection.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell>
                    <Link
                      href={`/samples/${sample.id}`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      {sample.accessionNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {sample.patientName ?? "Name not recorded"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sample.patientIdentifier}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{sample.requestedTest}</p>
                    <p className="text-xs text-muted-foreground">
                      {sample.department.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    {sample.dispatchRecord ? (
                      <>
                        <p className="text-sm">
                          {sample.dispatchRecord.receivedBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          From {sample.dispatchRecord.handedOverBy.name}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {sample.dispatchRecord
                      ? formatDateTime(sample.dispatchRecord.receivedAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {canCollect ? (
                      <div className="flex justify-end [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs">
                        <WorkflowActions
                          sampleId={sample.id}
                          transitions={collectionActions}
                          compact
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Awaiting dispatch staff
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Handover history</CardTitle>
          <CardDescription>
            The most recent dispatch handovers and their collection status.
          </CardDescription>
        </CardHeader>
        {data.handoverHistory.length === 0 ? (
          <CardContent className="p-5">
            <EmptyState
              icon={PackageCheck}
              title="No handovers recorded"
              description="Handover records are created when dispatch acknowledges a result."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Handed over</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Current status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.handoverHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Link
                      href={`/samples/${record.sample.id}`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      {record.sample.accessionNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {record.sample.patientName ?? "Name not recorded"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.sample.patientIdentifier}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{record.handedOverBy.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(record.dispatchedAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{record.receivedBy.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(record.receivedAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    {record.collectedAt && record.collectedBy ? (
                      <>
                        <p className="text-sm">{record.collectedBy.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(record.collectedAt)}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not collected
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={record.sample.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
