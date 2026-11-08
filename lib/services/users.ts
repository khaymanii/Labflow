import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { ApiUser } from "@/lib/api-auth";
import type { UserCreateInput, UserUpdateInput } from "@/lib/validations";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  departmentId: true,
  isActive: true,
  createdAt: true,
} as const;

async function assertDepartmentExists(departmentId?: string | null) {
  if (!departmentId) return;
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true },
  });
  if (!department) {
    throw new AppError("The selected department does not exist.", 400);
  }
}

export async function createUser(input: UserCreateInput) {
  await assertDepartmentExists(input.departmentId);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw new AppError("A user with this email already exists.", 409);
  }

  return prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      role: input.role,
      departmentId: input.departmentId ?? null,
    },
    select: safeUserSelect,
  });
}

export async function updateUser(
  userId: string,
  input: UserUpdateInput,
  actor: ApiUser,
) {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!target) {
    throw new AppError("User not found.", 404, "NOT_FOUND");
  }

  if (input.departmentId !== undefined) {
    await assertDepartmentExists(input.departmentId);
  }

  const removingAdminAccess =
    target.role === "ADMIN" &&
    target.isActive &&
    ((input.role !== undefined && input.role !== "ADMIN") ||
      input.isActive === false);

  if (removingAdminAccess) {
    const activeAdminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdminCount <= 1) {
      throw new AppError(
        "At least one active administrator is required.",
        409,
        "LAST_ADMIN",
      );
    }
  }

  if (target.id === actor.id && input.isActive === false) {
    throw new AppError(
      "You cannot deactivate your own account.",
      400,
      "SELF_DEACTIVATION",
    );
  }

  if (target.id === actor.id && input.role && input.role !== "ADMIN") {
    throw new AppError(
      "You cannot remove your own administrator role.",
      400,
      "SELF_DEMOTION",
    );
  }

  const data: {
    name?: string;
    role?: UserUpdateInput["role"];
    departmentId?: string | null;
    isActive?: boolean;
    passwordHash?: string;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.role !== undefined) data.role = input.role;
  if (input.departmentId !== undefined) data.departmentId = input.departmentId;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) data.passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect,
  });
}

export async function updateProfile(
  userId: string,
  input: { name: string; email: string },
) {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  });
  if (existing) {
    throw new AppError("Another account already uses this email.", 409);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name, email },
    select: safeUserSelect,
  });
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new AppError("User not found.", 404, "NOT_FOUND");
  }

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError("Your current password is incorrect.", 400);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
}
