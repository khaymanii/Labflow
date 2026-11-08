import {
  Building2,
  Clock,
  Database,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "@/components/ui/status-badge";
import { ProfileForm, PasswordForm } from "@/components/settings/settings-forms";
import { getCurrentUser, requireUser } from "@/lib/auth-guards";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and review the application configuration."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <ProfileForm currentName={user.name} currentEmail={user.email} />
          <PasswordForm />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Account
              </CardTitle>
              <CardDescription>
                Your role and laboratory assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Role</span>
                <RoleBadge role={user.role} />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">
                  {user.department?.name ?? "Unassigned"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Account status</span>
                <Badge variant={user.isActive ? "success" : "neutral"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-right font-medium">
                  {formatDateTime(user.createdAt)}
                </span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Role changes and department assignments are managed by an
                administrator.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Application
              </CardTitle>
              <CardDescription>LabFlow MVP configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Application
                </span>
                <span className="font-medium">LabFlow</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-3.5 w-3.5" />
                  Version
                </span>
                <Badge variant="neutral">MVP 1.0</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Timezone
                </span>
                <span className="font-medium">Africa/Lagos (WAT)</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" />
                  Theme
                </span>
                <span className="font-medium">Light</span>
              </div>
              <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
                LabFlow is a workflow tracking tool, not a diagnostic or clinical
                decision-support system. Do not enter actual clinical results.
              </p>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">Role summary</p>
            <p className="mt-1">{ROLE_LABELS[user.role]}</p>
            <p className="mt-1">
              {user.role === "ADMIN"
                ? "Full access, including user management and every workflow action."
                : user.role === "DISPATCH"
                  ? "Can acknowledge result handovers and record patient collection."
                  : user.role === "SCIENTIST"
                    ? "Can register samples, process them, produce results and send to dispatch."
                    : "Can register samples, start processing and send results to dispatch."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
