import { PageHeader } from "@/components/ui/page-header";
import { UsersManager } from "@/components/users/users-manager";
import { requireRole } from "@/lib/auth-guards";
import { getDepartmentOptions } from "@/lib/data/departments";
import { listUsers } from "@/lib/data/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireRole(["ADMIN"]);
  const [users, departments] = await Promise.all([
    listUsers(),
    getDepartmentOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage laboratory accounts, roles and access. Only administrators can view this page."
      />
      <UsersManager
        users={users}
        departments={departments}
        currentUserId={user.id}
      />
    </div>
  );
}
