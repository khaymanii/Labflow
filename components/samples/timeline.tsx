import { StatusBadge } from "@/components/ui/status-badge";
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Role, SampleStatus } from "@prisma/client";

type TimelineEvent = {
  id: string;
  previousStatus: SampleStatus | null;
  newStatus: SampleStatus;
  note: string | null;
  createdAt: Date;
  performedBy: {
    name: string;
    role: Role;
    department?: { name: string } | null;
  };
};

export function SampleTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No workflow events have been recorded for this sample.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border"
              />
            ) : null}
            <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-lg border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={event.newStatus} />
                <span className="text-xs text-muted-foreground">
                  {event.previousStatus
                    ? `from ${STATUS_LABELS[event.previousStatus]}`
                    : "Workflow started"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 text-sm">
                <span className="font-medium">{event.performedBy.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {ROLE_LABELS[event.performedBy.role]}
                  {event.performedBy.department?.name
                    ? ` · ${event.performedBy.department.name}`
                    : ""}
                </span>
              </p>
              {event.note ? (
                <p className="mt-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm text-muted-foreground">
                  {event.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
