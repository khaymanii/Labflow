import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [statusGroups, total, recentEvents, departments] = await Promise.all([
    prisma.sample.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.sample.count(),
    prisma.workflowEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        sample: {
          select: {
            id: true,
            accessionNumber: true,
            patientName: true,
            patientIdentifier: true,
            status: true,
          },
        },
        performedBy: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { samples: true } },
      },
    }),
  ]);

  const counts = statusGroups.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  return {
    total,
    counts,
    recentEvents,
    departments,
  };
}
