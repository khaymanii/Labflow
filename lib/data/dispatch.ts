import { prisma } from "@/lib/prisma";
import { DISPATCH_HISTORY_LIMIT } from "@/lib/constants";

export async function getDispatchData() {
  const now = new Date();
  const lagosToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const startOfToday = new Date(`${lagosToday}T00:00:00+01:00`);

  const [awaitingDispatch, awaitingCollection, handoverHistory, collectedToday] =
    await Promise.all([
      prisma.sample.findMany({
        where: { status: "AWAITING_DISPATCH" },
        orderBy: { updatedAt: "asc" },
        include: {
          department: { select: { id: true, name: true } },
          registeredBy: { select: { id: true, name: true } },
          workflowEvents: {
            where: { newStatus: "AWAITING_DISPATCH" },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { performedBy: { select: { id: true, name: true, role: true } } },
          },
        },
      }),
      prisma.sample.findMany({
        where: { status: "RECEIVED_AT_DISPATCH" },
        orderBy: { updatedAt: "asc" },
        include: {
          department: { select: { id: true, name: true } },
          registeredBy: { select: { id: true, name: true } },
          dispatchRecord: {
            include: {
              handedOverBy: { select: { id: true, name: true } },
              receivedBy: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.dispatchRecord.findMany({
        orderBy: { receivedAt: "desc" },
        take: DISPATCH_HISTORY_LIMIT,
        include: {
          sample: {
            select: {
              id: true,
              accessionNumber: true,
              patientName: true,
              patientIdentifier: true,
              requestedTest: true,
              status: true,
            },
          },
          handedOverBy: { select: { id: true, name: true } },
          receivedBy: { select: { id: true, name: true } },
          collectedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.dispatchRecord.count({
        where: { collectedAt: { gte: startOfToday } },
      }),
    ]);

  return {
    awaitingDispatch,
    awaitingCollection,
    handoverHistory,
    collectedToday,
  };
}
