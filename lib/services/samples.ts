import { Prisma, Role, SampleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { getTransition } from "@/lib/workflow";
import type { SampleCreateInput } from "@/lib/validations";
import type { ApiUser } from "@/lib/api-auth";

const REGISTRATION_ROLES: Role[] = ["INTERN", "SCIENTIST", "ADMIN"];

function lagosDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}`;
}

export async function generateAccessionNumber(
  tx: Prisma.TransactionClient,
  now = new Date(),
) {
  const prefix = `LF-${lagosDateParts(now)}-`;
  const lastSample = await tx.sample.findFirst({
    where: { accessionNumber: { startsWith: prefix } },
    orderBy: { accessionNumber: "desc" },
    select: { accessionNumber: true },
  });

  const lastSequence = lastSample
    ? Number.parseInt(lastSample.accessionNumber.split("-").at(-1) ?? "0", 10)
    : 0;

  const nextSequence = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;
  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

export async function createSample(input: SampleCreateInput, actor: ApiUser) {
  if (!REGISTRATION_ROLES.includes(actor.role)) {
    throw new AppError(
      "You do not have permission to register samples.",
      403,
      "FORBIDDEN",
    );
  }

  const department = await prisma.department.findUnique({
    where: { id: input.departmentId },
    select: { id: true },
  });

  if (!department) {
    throw new AppError("The selected department does not exist.", 400);
  }

  // Retry in the unlikely event that two registrations generate the same
  // daily accession number at the same time.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const accessionNumber = await generateAccessionNumber(tx);
        const now = new Date();

        return tx.sample.create({
          data: {
            accessionNumber,
            patientIdentifier: input.patientIdentifier,
            patientName: input.patientName?.trim() || null,
            sampleType: input.sampleType,
            requestedTest: input.requestedTest,
            departmentId: input.departmentId,
            registeredById: actor.id,
            createdAt: now,
            updatedAt: now,
            workflowEvents: {
              create: {
                previousStatus: null,
                newStatus: SampleStatus.REGISTERED,
                performedById: actor.id,
                note: input.note?.trim() || "Sample registered.",
                createdAt: now,
              },
            },
          },
          select: {
            id: true,
            accessionNumber: true,
            status: true,
            createdAt: true,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 3
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new AppError("Could not generate an accession number. Try again.", 500);
}

export async function transitionSample(
  sampleId: string,
  toStatus: SampleStatus,
  note: string | undefined,
  actor: ApiUser,
) {
  const cleanNote = note?.trim() || null;

  return prisma.$transaction(async (tx) => {
    const sample = await tx.sample.findUnique({
      where: { id: sampleId },
      include: {
        dispatchRecord: { select: { id: true, collectedAt: true } },
        workflowEvents: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            performedById: true,
            createdAt: true,
            newStatus: true,
          },
        },
      },
    });

    if (!sample) {
      throw new AppError("Sample not found.", 404, "NOT_FOUND");
    }

    const transition = getTransition(sample.status, toStatus);
    if (!transition) {
      throw new AppError(
        `Cannot move a sample from ${sample.status} to ${toStatus}.`,
        409,
        "INVALID_TRANSITION",
      );
    }

    if (!transition.allowedRoles.includes(actor.role)) {
      throw new AppError(
        "Your role cannot perform this workflow step.",
        403,
        "FORBIDDEN",
      );
    }

    if (toStatus === "RECEIVED_AT_DISPATCH" && sample.dispatchRecord) {
      throw new AppError(
        "A dispatch handover already exists for this sample.",
        409,
        "DUPLICATE_HANDOVER",
      );
    }

    if (toStatus === "COLLECTED" && !sample.dispatchRecord) {
      throw new AppError(
        "This result must be received at dispatch before collection.",
        409,
        "MISSING_HANDOVER",
      );
    }

    const now = new Date();

    // Optimistic status check: prevents two users from performing the same
    // transition concurrently.
    const updated = await tx.sample.updateMany({
      where: { id: sampleId, status: sample.status },
      data: { status: toStatus },
    });

    if (updated.count !== 1) {
      throw new AppError(
        "This sample was updated by another user. Refresh and try again.",
        409,
        "STALE_STATUS",
      );
    }

    if (toStatus === "RECEIVED_AT_DISPATCH") {
      const handoverEvent = sample.workflowEvents[0];
      if (!handoverEvent || handoverEvent.newStatus !== "AWAITING_DISPATCH") {
        throw new AppError(
          "The laboratory handover could not be confirmed. Refresh and try again.",
          409,
          "MISSING_HANDOVER_EVENT",
        );
      }

      await tx.dispatchRecord.create({
        data: {
          sampleId,
          handedOverById: handoverEvent.performedById,
          receivedById: actor.id,
          dispatchedAt: handoverEvent.createdAt,
          receivedAt: now,
          notes: cleanNote,
        },
      });
    }

    if (toStatus === "COLLECTED") {
      await tx.dispatchRecord.update({
        where: { sampleId },
        data: {
          collectedAt: now,
          collectedById: actor.id,
        },
      });
    }

    const event = await tx.workflowEvent.create({
      data: {
        sampleId,
        previousStatus: sample.status,
        newStatus: toStatus,
        performedById: actor.id,
        note: cleanNote,
        createdAt: now,
      },
      select: {
        id: true,
        previousStatus: true,
        newStatus: true,
        createdAt: true,
      },
    });

    return { sampleId, status: toStatus, event };
  });
}

export async function getSampleStatusSummary() {
  const grouped = await prisma.sample.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return grouped.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});
}
