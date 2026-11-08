import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  href?: string;
  tone?: "default" | "blue" | "amber" | "cyan" | "primary" | "violet";
};

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  blue: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  cyan: "bg-cyan-50 text-cyan-600",
  primary: "bg-primary/10 text-primary",
  violet: "bg-violet-50 text-violet-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = "default",
}: StatCardProps) {
  const content = (
    <Card className={cn("h-full transition-colors", href && "hover:border-primary/30")}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("rounded-lg p-2.5", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
