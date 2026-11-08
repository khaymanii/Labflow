import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
};

/**
 * Resolve the API caller from the session and re-check the database so that
 * deactivated users and role changes take effect immediately.
 */
export async function requireApiUser(): Promise<ApiUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("You must be signed in to perform this action.", 401, "UNAUTHENTICATED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    throw new AppError("Your account is inactive. Contact an administrator.", 401, "INACTIVE_ACCOUNT");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  };
}

export function requireApiRole(user: ApiUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new AppError("You do not have permission to perform this action.", 403, "FORBIDDEN");
  }
}
