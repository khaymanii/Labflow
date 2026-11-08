import { Prisma, SampleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SAMPLE_PAGE_SIZE } from "@/lib/constants";

export type SampleListFilters = {
  q?: string;
  status?: string;
  departmentId?: string;
  from?: string;
  to?: string;
  page?: string;
};

const sampleListInclude = {
  department: { select: { id: true, name: true } },
  registeredBy: { select: { id: true, name: true } },
  workflowEvents: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      newStatus: true,
      createdAt: true,
      performedBy: { select: { id: true, name: true, role: true } },
    },
  },
};

export async function listSamples(filters: SampleListFilters) {
  const where: Prisma.SampleWhereInput = {};

  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { accessionNumber: { contains: q, mode: "insensitive" } },
      { patientIdentifier: { contains: q, mode: "insensitive" } },
      { patientName: { contains: q, mode: "insensitive" } },
    ];
  }

  if (
    filters.status &&
    Object.values(SampleStatus).includes(filters.status as SampleStatus)
  ) {
    where.status = filters.status as SampleStatus;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  const createdAt: Prisma.DateTimeFilter = {};
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) {
    const from = new Date(`${filters.from}T00:00:00+01:00`);
    if (!Number.isNaN(from.getTime())) createdAt.gte = from;
  }
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) {
    const to = new Date(`${filters.to}T23:59:59.999+01:00`);
    if (!Number.isNaN(to.getTime())) createdAt.lte = to;
  }
  if (Object.keys(createdAt).length > 0) {
    where.createdAt = createdAt;
  }

  const parsedPage = Number.parseInt(filters.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [samples, total] = await prisma.$transaction([
    prisma.sample.findMany({
      where,
      include: sampleListInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * SAMPLE_PAGE_SIZE,
      take: SAMPLE_PAGE_SIZE,
    }),
    prisma.sample.count({ where }),
  ]);

  return {
    samples,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / SAMPLE_PAGE_SIZE)),
    pageSize: SAMPLE_PAGE_SIZE,
  };
}

export async function getSampleById(id: string) {
  return prisma.sample.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true } },
      registeredBy: { select: { id: true, name: true, email: true } },
      workflowEvents: {
        orderBy: { createdAt: "asc" },
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              role: true,
              department: { select: { name: true } },
            },
          },
        },
      },
      dispatchRecord: {
        include: {
          handedOverBy: { select: { id: true, name: true, role: true } },
          receivedBy: { select: { id: true, name: true, role: true } },
          collectedBy: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
}

export async function getRecentSampleCounts() {
  const grouped = await prisma.sample.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return grouped.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});
}
