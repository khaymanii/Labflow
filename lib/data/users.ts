import { prisma } from "@/lib/prisma";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
      _count: { select: { registeredSamples: true, workflowEvents: true } },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { department: true },
  });
}
