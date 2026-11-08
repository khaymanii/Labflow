import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  basePath: string;
  params: Record<string, string | undefined>;
};

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  basePath,
  params,
}: PaginationProps) {
  const buildHref = (targetPage: number) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") search.set(key, value);
    });
    if (targetPage > 1) search.set("page", String(targetPage));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> samples
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={page <= 1}
          className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
        >
          <Link href={buildHref(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        </Button>
        <span className="px-1 text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
        >
          <Link href={buildHref(page + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
