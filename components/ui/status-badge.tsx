import type { SampleStatus, Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, ROLE_SHORT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SampleStatus, { badge: string; dot: string }> = {
  REGISTERED: {
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-400",
  },
  PROCESSING: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  RESULT_PRODUCED: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  AWAITING_DISPATCH: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  RECEIVED_AT_DISPATCH: {
    badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
  },
  COLLECTED: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: SampleStatus;
  className?: string;
}) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}

const ROLE_STYLES: Record<Role, string> = {
  INTERN: "border-slate-200 bg-slate-50 text-slate-700",
  SCIENTIST: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DISPATCH: "border-cyan-200 bg-cyan-50 text-cyan-700",
  ADMIN: "border-amber-200 bg-amber-50 text-amber-800",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant="outline" className={cn("font-medium", ROLE_STYLES[role])}>
      {ROLE_SHORT_LABELS[role]}
    </Badge>
  );
}
