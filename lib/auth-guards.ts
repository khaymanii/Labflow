import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireUser() {
  const session = await requireSession();
  return session.user;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireSession();
  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  if (!current?.isActive) {
    redirect("/login?inactive=1");
  }

  if (!allowedRoles.includes(current.role)) {
    redirect("/dashboard");
  }

  return { ...session.user, role: current.role };
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { department: true },
  });
}
