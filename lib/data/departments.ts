import { prisma } from "@/lib/prisma";

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { samples: true, users: true } },
    },
  });
}

export async function getDepartmentOptions() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
