import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";

type DepartmentOption = { id: string; name: string };

type SampleFiltersProps = {
  departments: DepartmentOption[];
  q?: string;
  status?: string;
  departmentId?: string;
  from?: string;
  to?: string;
};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function SampleFilters({
  departments,
  q,
  status,
  departmentId,
  from,
  to,
}: SampleFiltersProps) {
  const hasFilters = Boolean(q || status || departmentId || from || to);

  return (
    <form
      method="get"
      action="/samples"
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        Search and filter
        {hasFilters ? (
          <Button asChild variant="ghost" size="sm" className="ml-auto h-7 text-xs">
            <Link href="/samples">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="q" className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Sample ID, patient ID or name"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <select id="status" name="status" defaultValue={status ?? ""} className={selectClass}>
            <option value="">All statuses</option>
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departmentId" className="text-xs text-muted-foreground">
            Department
          </Label>
          <select
            id="departmentId"
            name="departmentId"
            defaultValue={departmentId ?? ""}
            className={selectClass}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="from" className="text-xs text-muted-foreground">
            Registered from
          </Label>
          <Input id="from" name="from" type="date" defaultValue={from} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="to" className="text-xs text-muted-foreground">
            Registered to
          </Label>
          <Input id="to" name="to" type="date" defaultValue={to} />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
