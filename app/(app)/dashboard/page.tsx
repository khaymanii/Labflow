import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Inbox,
  Microscope,
  PackageCheck,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth-guards";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatDateTime } from "@/lib/utils";
import { ROLE_SHORT_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData();

  const canRegister = ["INTERN", "SCIENTIST", "ADMIN"].includes(user.role);
  const today = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={today}
        title={`Welcome back, ${user.name?.split(" ")[0] ?? "there"}`}
        description="A live view of laboratory samples, workflow progress and recent activity."
        actions={
          canRegister ? (
            <Button asChild>
              <Link href="/samples/new">
                <Plus className="h-4 w-4" />
                Register sample
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/dispatch">
                <Send className="h-4 w-4" />
                Open dispatch queue
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total samples"
          value={data.total}
          icon={ClipboardList}
          hint="All registered samples"
          href="/samples"
        />
        <StatCard
          label="Processing"
          value={data.counts.PROCESSING ?? 0}
          icon={Microscope}
          tone="blue"
          hint="Currently in the laboratory"
          href="/samples?status=PROCESSING"
        />
        <StatCard
          label="Awaiting dispatch"
          value={data.counts.AWAITING_DISPATCH ?? 0}
          icon={Send}
          tone="amber"
          hint="Results ready for handover"
          href="/dispatch"
        />
        <StatCard
          label="Ready for collection"
          value={data.counts.RECEIVED_AT_DISPATCH ?? 0}
          icon={Inbox}
          tone="cyan"
          hint="Received at dispatch"
          href="/dispatch"
        />
        <StatCard
          label="Collected"
          value={data.counts.COLLECTED ?? 0}
          icon={CheckCircle2}
          tone="primary"
          hint="Completed workflows"
          href="/samples?status=COLLECTED"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Recent laboratory activity</CardTitle>
              <CardDescription>
                The latest workflow events recorded by staff.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/samples">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentEvents.length === 0 ? (
              <EmptyState
                icon={FlaskConical}
                title="No activity yet"
                description="Register the first sample to start building the laboratory workflow."
                action={
                  canRegister ? (
                    <Button asChild size="sm">
                      <Link href="/samples/new">
                        <Plus className="h-4 w-4" />
                        Register sample
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ol className="divide-y">
                {data.recentEvents.map((event) => (
                  <li key={event.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      {event.previousStatus ? (
                        <ArrowRight className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link
                          href={`/samples/${event.sample.id}`}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {event.sample.accessionNumber}
                        </Link>
                        <StatusBadge status={event.newStatus} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.previousStatus
                          ? `${STATUS_LABELS[event.previousStatus]} → ${STATUS_LABELS[event.newStatus]}`
                          : "Sample registered"}{" "}
                        by{" "}
                        <span className="font-medium text-foreground">
                          {event.performedBy.name}
                        </span>{" "}
                        <span className="text-xs">
                          ({ROLE_SHORT_LABELS[event.performedBy.role]})
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.sample.patientName ?? event.sample.patientIdentifier} ·{" "}
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow overview</CardTitle>
              <CardDescription>Samples at each stage right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {STATUS_ORDER.map((status, index) => {
                const count = data.counts[status] ?? 0;
                const percent =
                  data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                          {index + 1}
                        </span>
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.max(percent, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Sample volume by laboratory unit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.departments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No departments have been configured.
                </p>
              ) : (
                data.departments.map((department) => (
                  <Link
                    key={department.id}
                    href={`/samples?departmentId=${department.id}`}
                    className="flex items-center justify-between rounded-md px-1 py-1 text-sm hover:text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      {department.name}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {department._count.samples}
                    </span>
                  </Link>
                ))
              )}
              {user.role === "ADMIN" ? (
                <div className="border-t pt-3">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/users">
                      <Users className="h-4 w-4" />
                      Manage users
                    </Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
