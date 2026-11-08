"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type DepartmentOption = { id: string; name: string };

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  isActive: boolean;
  createdAt: Date;
  department: { id: string; name: string } | null;
  _count: { registeredSamples: number; workflowEvents: number };
};

type UsersManagerProps = {
  users: ManagedUser[];
  departments: DepartmentOption[];
  currentUserId: string;
};

const ROLES: Role[] = ["INTERN", "SCIENTIST", "DISPATCH", "ADMIN"];

export function UsersManager({
  users,
  departments,
  currentUserId,
}: UsersManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.department?.name.toLowerCase().includes(term) ?? false),
    );
  }, [users, search]);

  const activeCount = users.filter((user) => user.isActive).length;

  return (
    <div className="space-y-4">
      {success ? (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users by name, email or department"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">
            {users.length} total · {activeCount} active
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              setSuccess(null);
              setCreateOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add user
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title={search ? "No users match your search" : "No users yet"}
              description={
                search
                  ? "Try a different name, email address or department."
                  : "Add laboratory staff accounts to give them access."
              }
              action={
                !search ? (
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add user
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Samples</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={!user.isActive ? "opacity-70" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">
                          {user.name}
                          {user.id === currentUserId ? (
                            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.department?.name ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {user._count.registeredSamples}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSuccess(null);
                        setEditing(user);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        departments={departments}
        onSuccess={(message) => {
          setCreateOpen(false);
          setSuccess(message);
          router.refresh();
        }}
      />

      <EditUserDialog
        user={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        departments={departments}
        currentUserId={currentUserId}
        onSuccess={(message) => {
          setEditing(null);
          setSuccess(message);
          router.refresh();
        }}
      />
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentOption[];
  onSuccess: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("INTERN");
  const [departmentId, setDepartmentId] = useState("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("INTERN");
    setDepartmentId("none");
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          departmentId: departmentId === "none" ? undefined : departmentId,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Could not create the user.");
        return;
      }

      reset();
      onSuccess(`${payload.user.name} was added to the laboratory team.`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a laboratory user</DialogTitle>
          <DialogDescription>
            Create a staff account and assign the role that controls workflow
            access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-name">Full name</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-email">Email address</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Temporary password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((roleValue) => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {ROLE_LABELS[roleValue]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-department">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="new-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {loading ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onOpenChange,
  departments,
  currentUserId,
  onSuccess,
}: {
  user: ManagedUser | null;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentOption[];
  currentUserId: string;
  onSuccess: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("INTERN");
  const [departmentId, setDepartmentId] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role);
    setDepartmentId(user.departmentId ?? "none");
    setIsActive(user.isActive);
    setPassword("");
    setError(null);
  }, [user]);

  if (!user) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const isSelf = user.id === currentUserId;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          departmentId: departmentId === "none" ? null : departmentId,
          isActive,
          password: password || undefined,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Could not update the user.");
        return;
      }

      setPassword("");
      onSuccess(`${payload.user.name}'s account was updated.`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update the account for {user.email}. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-name">Full name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                disabled={isSelf}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((roleValue) => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {ROLE_LABELS[roleValue]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSelf ? (
                <p className="text-xs text-muted-foreground">
                  You cannot change your own administrator role.
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="edit-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No department</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-password">
                New password <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                autoComplete="new-password"
                placeholder="Leave blank to keep the current password"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  disabled={isSelf}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary"
                />
                <span>
                  <span className="block font-medium">Account active</span>
                  <span className="block text-xs text-muted-foreground">
                    Inactive users cannot sign in.{" "}
                    {isSelf ? "You cannot deactivate your own account." : ""}
                  </span>
                </span>
              </label>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
