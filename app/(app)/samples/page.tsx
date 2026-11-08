import Link from "next/link";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SampleFilters } from "@/components/samples/sample-filters";
import { Pagination } from "@/components/samples/pagination";
import { requireUser } from "@/lib/auth-guards";
import { getDepartmentOptions } from "@/lib/data/departments";
import { listSamples } from "@/lib/data/samples";
import { formatDateTime } from "@/lib/utils";
import { ROLE_SHORT_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SamplesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SamplesPage({ searchParams }: SamplesPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  const filters = {
    q: first(params.q)?.slice(0, 100),
    status: first(params.status),
    departmentId: first(params.departmentId),
    from: first(params.from),
    to: first(params.to),
    page: first(params.page),
  };

  const [result, departments] = await Promise.all([
    listSamples(filters),
    getDepartmentOptions(),
  ]);

  const canRegister = ["INTERN", "SCIENTIST", "ADMIN"].includes(user.role);
  const hasFilters = Boolean(
    filters.q || filters.status || filters.departmentId || filters.from || filters.to,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Samples"
        description="Search and track every sample registered in the laboratory."
        actions={
          canRegister ? (
            <Button asChild>
              <Link href="/samples/new">
                <Plus className="h-4 w-4" />
                Register sample
              </Link>
            </Button>
          ) : null
        }
      />

      <SampleFilters
        departments={departments}
        q={filters.q}
        status={filters.status}
        departmentId={filters.departmentId}
        from={filters.from}
        to={filters.to}
      />

      <Card className="overflow-hidden">
        {result.samples.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title={hasFilters ? "No samples match your filters" : "No samples registered yet"}
              description={
                hasFilters
                  ? "Try a different search term, status or date range."
                  : "Register the first sample to begin tracking the laboratory workflow."
              }
              action={
                hasFilters ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/samples">Clear filters</Link>
                  </Button>
                ) : canRegister ? (
                  <Button asChild size="sm">
                    <Link href="/samples/new">
                      <Plus className="h-4 w-4" />
                      Register sample
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test / type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current handler</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.samples.map((sample) => {
                  const latestEvent = sample.workflowEvents[0];
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
                        <p className="font-medium">{sample.requestedTest}</p>
                        <p className="text-xs text-muted-foreground">
                          {sample.sampleType}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sample.department.name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sample.status} />
                      </TableCell>
                      <TableCell>
                        {latestEvent ? (
                          <>
                            <p className="text-sm">{latestEvent.performedBy.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ROLE_SHORT_LABELS[latestEvent.performedBy.role]}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(sample.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/samples/${sample.id}`} aria-label="Open sample">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              pageSize={result.pageSize}
              basePath="/samples"
              params={filters}
            />
          </>
        )}
      </Card>
    </div>
  );
}
