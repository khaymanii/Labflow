import { Circle, Check } from "lucide-react";
import type { SampleStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SampleProgress({ status }: { status: SampleStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {STATUS_ORDER.map((step, index) => {
        const complete = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            className={cn(
              "rounded-lg border p-3",
              current
                ? "border-primary/30 bg-primary/5"
                : complete
                  ? "border-primary/20 bg-primary/5"
                  : "border-dashed bg-muted/20",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  current
                    ? "border-primary bg-primary text-primary-foreground"
                    : complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium leading-tight",
                  current ? "text-primary" : complete ? "text-primary" : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {current ? (
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-primary">
                Current stage
              </p>
            ) : complete ? (
              <p className="mt-1.5 text-[11px] text-primary/80">Completed</p>
            ) : (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Circle className="h-2 w-2" /> Pending
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
