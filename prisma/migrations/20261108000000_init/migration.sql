-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INTERN', 'SCIENTIST', 'DISPATCH', 'ADMIN');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('REGISTERED', 'PROCESSING', 'RESULT_PRODUCED', 'AWAITING_DISPATCH', 'RECEIVED_AT_DISPATCH', 'COLLECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INTERN',
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL,
    "accessionNumber" TEXT NOT NULL,
    "patientIdentifier" TEXT NOT NULL,
    "patientName" TEXT,
    "sampleType" TEXT NOT NULL,
    "requestedTest" TEXT NOT NULL,
    "status" "SampleStatus" NOT NULL DEFAULT 'REGISTERED',
    "departmentId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEvent" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "previousStatus" "SampleStatus",
    "newStatus" "SampleStatus" NOT NULL,
    "performedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchRecord" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "handedOverById" TEXT NOT NULL,
    "receivedById" TEXT NOT NULL,
    "collectedById" TEXT,
    "dispatchedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "collectedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sample_accessionNumber_key" ON "Sample"("accessionNumber");

-- CreateIndex
CREATE INDEX "Sample_status_idx" ON "Sample"("status");

-- CreateIndex
CREATE INDEX "Sample_departmentId_idx" ON "Sample"("departmentId");

-- CreateIndex
CREATE INDEX "Sample_patientIdentifier_idx" ON "Sample"("patientIdentifier");

-- CreateIndex
CREATE INDEX "Sample_createdAt_idx" ON "Sample"("createdAt");

-- CreateIndex
CREATE INDEX "Sample_registeredById_idx" ON "Sample"("registeredById");

-- CreateIndex
CREATE INDEX "WorkflowEvent_sampleId_createdAt_idx" ON "WorkflowEvent"("sampleId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowEvent_performedById_idx" ON "WorkflowEvent"("performedById");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchRecord_sampleId_key" ON "DispatchRecord"("sampleId");

-- CreateIndex
CREATE INDEX "DispatchRecord_receivedAt_idx" ON "DispatchRecord"("receivedAt");

-- CreateIndex
CREATE INDEX "DispatchRecord_collectedAt_idx" ON "DispatchRecord"("collectedAt");

-- CreateIndex
CREATE INDEX "DispatchRecord_handedOverById_idx" ON "DispatchRecord"("handedOverById");

-- CreateIndex
CREATE INDEX "DispatchRecord_receivedById_idx" ON "DispatchRecord"("receivedById");

-- CreateIndex
CREATE INDEX "DispatchRecord_collectedById_idx" ON "DispatchRecord"("collectedById");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchRecord" ADD CONSTRAINT "DispatchRecord_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchRecord" ADD CONSTRAINT "DispatchRecord_handedOverById_fkey" FOREIGN KEY ("handedOverById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchRecord" ADD CONSTRAINT "DispatchRecord_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchRecord" ADD CONSTRAINT "DispatchRecord_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

