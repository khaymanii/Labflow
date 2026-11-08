import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SampleForm } from "@/components/samples/sample-form";
import { requireRole, getCurrentUser } from "@/lib/auth-guards";
import { getDepartmentOptions } from "@/lib/data/departments";

export const dynamic = "force-dynamic";

export default async function NewSamplePage() {
  const user = await requireRole(["INTERN", "SCIENTIST", "ADMIN"]);
  const [departments, currentUser] = await Promise.all([
    getDepartmentOptions(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register a sample"
        description="Log a new sample into the laboratory workflow. The accession number is generated automatically."
        actions={
          <Button asChild variant="outline">
            <Link href="/samples">
              <ArrowLeft className="h-4 w-4" />
              Back to samples
            </Link>
          </Button>
        }
      />

      {departments.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm font-medium">No departments configured</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run the database seed or ask an administrator to create a department
            before registering samples.
          </p>
        </div>
      ) : (
        <SampleForm
          departments={departments}
          defaultDepartmentId={
            currentUser?.departmentId ?? user.departmentId ?? departments[0]?.id
          }
        />
      )}
    </div>
  );
}
