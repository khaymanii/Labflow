import {
  PrismaClient,
  Role,
  SampleStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";
const NOW = new Date();

type TestDefinition = {
  sampleType: string;
  department: string;
};

const TEST_CATALOG: Record<string, TestDefinition> = {
  "Full Blood Count": {
    sampleType: "Whole Blood (EDTA)",
    department: "Haematology & Blood Transfusion",
  },
  "Malaria Parasite": {
    sampleType: "Whole Blood (EDTA)",
    department: "Haematology & Blood Transfusion",
  },
  "Blood Group & Genotype": {
    sampleType: "Whole Blood (EDTA)",
    department: "Haematology & Blood Transfusion",
  },
  "Blood Glucose": {
    sampleType: "Plasma",
    department: "Clinical Chemistry",
  },
  "Lipid Profile": {
    sampleType: "Serum",
    department: "Clinical Chemistry",
  },
  "Liver Function Test": {
    sampleType: "Serum",
    department: "Clinical Chemistry",
  },
  "Renal Function Test": {
    sampleType: "Serum",
    department: "Clinical Chemistry",
  },
  Urinalysis: {
    sampleType: "Urine",
    department: "Clinical Chemistry",
  },
  "Pregnancy Test (hCG)": {
    sampleType: "Urine",
    department: "Clinical Chemistry",
  },
  "Widal Test": {
    sampleType: "Serum",
    department: "Serology & Immunology",
  },
  "HIV Screening": {
    sampleType: "Serum",
    department: "Serology & Immunology",
  },
  "Hepatitis B Surface Antigen": {
    sampleType: "Serum",
    department: "Serology & Immunology",
  },
  "Hepatitis C Antibody": {
    sampleType: "Serum",
    department: "Serology & Immunology",
  },
  "Culture & Sensitivity": {
    sampleType: "Urine",
    department: "Medical Microbiology",
  },
  "Stool Microscopy": {
    sampleType: "Stool",
    department: "Medical Microbiology",
  },
};

type SampleSeed = {
  patientName: string;
  patientIdentifier: string;
  test: keyof typeof TEST_CATALOG;
  status: SampleStatus;
};

const SAMPLES: SampleSeed[] = [
  {
    patientName: "Adaeze Okafor",
    patientIdentifier: "LUTH/2026/00124",
    test: "Full Blood Count",
    status: "COLLECTED",
  },
  {
    patientName: "Ibrahim Musa",
    patientIdentifier: "LUTH/2026/00125",
    test: "Malaria Parasite",
    status: "COLLECTED",
  },
  {
    patientName: "Chiamaka Nwosu",
    patientIdentifier: "UCH/2026/00481",
    test: "Lipid Profile",
    status: "COLLECTED",
  },
  {
    patientName: "Emeka Obi",
    patientIdentifier: "UCH/2026/00482",
    test: "Liver Function Test",
    status: "RECEIVED_AT_DISPATCH",
  },
  {
    patientName: "Fatima Abdullahi",
    patientIdentifier: "FMC/2026/01012",
    test: "Widal Test",
    status: "RECEIVED_AT_DISPATCH",
  },
  {
    patientName: "Tobi Adewale",
    patientIdentifier: "LUTH/2026/00128",
    test: "Blood Glucose",
    status: "RECEIVED_AT_DISPATCH",
  },
  {
    patientName: "Grace Eze",
    patientIdentifier: "UCH/2026/00486",
    test: "Urinalysis",
    status: "AWAITING_DISPATCH",
  },
  {
    patientName: "Samuel Ogunleye",
    patientIdentifier: "FMC/2026/01018",
    test: "Hepatitis B Surface Antigen",
    status: "AWAITING_DISPATCH",
  },
  {
    patientName: "Halima Bello",
    patientIdentifier: "LUTH/2026/00131",
    test: "Culture & Sensitivity",
    status: "AWAITING_DISPATCH",
  },
  {
    patientName: "Chinedu Anike",
    patientIdentifier: "UCH/2026/00490",
    test: "Full Blood Count",
    status: "RESULT_PRODUCED",
  },
  {
    patientName: "Blessing Ojo",
    patientIdentifier: "FMC/2026/01021",
    test: "Pregnancy Test (hCG)",
    status: "RESULT_PRODUCED",
  },
  {
    patientName: "Yusuf Danjuma",
    patientIdentifier: "LUTH/2026/00134",
    test: "Renal Function Test",
    status: "PROCESSING",
  },
  {
    patientName: "Ngozi Kalu",
    patientIdentifier: "UCH/2026/00494",
    test: "HIV Screening",
    status: "PROCESSING",
  },
  {
    patientName: "Abubakar Sadiq",
    patientIdentifier: "FMC/2026/01025",
    test: "Stool Microscopy",
    status: "PROCESSING",
  },
  {
    patientName: "Funke Adebayo",
    patientIdentifier: "LUTH/2026/00137",
    test: "Blood Group & Genotype",
    status: "REGISTERED",
  },
  {
    patientName: "Kelechi Umeh",
    patientIdentifier: "UCH/2026/00497",
    test: "Liver Function Test",
    status: "REGISTERED",
  },
  {
    patientName: "Aisha Lawal",
    patientIdentifier: "FMC/2026/01029",
    test: "Malaria Parasite",
    status: "REGISTERED",
  },
  {
    patientName: "Peter Idoko",
    patientIdentifier: "LUTH/2026/00140",
    test: "Hepatitis C Antibody",
    status: "COLLECTED",
  },
  {
    patientName: "Rukayat Salami",
    patientIdentifier: "UCH/2026/00501",
    test: "Blood Glucose",
    status: "COLLECTED",
  },
  {
    patientName: "Daniel Etim",
    patientIdentifier: "FMC/2026/01033",
    test: "Full Blood Count",
    status: "RECEIVED_AT_DISPATCH",
  },
  {
    patientName: "Amaka Ibe",
    patientIdentifier: "LUTH/2026/00143",
    test: "Urinalysis",
    status: "AWAITING_DISPATCH",
  },
  {
    patientName: "Musa Garba",
    patientIdentifier: "UCH/2026/00505",
    test: "Widal Test",
    status: "PROCESSING",
  },
  {
    patientName: "Esther Bamgbose",
    patientIdentifier: "FMC/2026/01037",
    test: "Lipid Profile",
    status: "RESULT_PRODUCED",
  },
  {
    patientName: "Victor Nnamdi",
    patientIdentifier: "LUTH/2026/00146",
    test: "Culture & Sensitivity",
    status: "COLLECTED",
  },
  {
    patientName: "Zainab Yakubu",
    patientIdentifier: "UCH/2026/00508",
    test: "Hepatitis B Surface Antigen",
    status: "REGISTERED",
  },
  {
    patientName: "Olumide Ajayi",
    patientIdentifier: "FMC/2026/01041",
    test: "Renal Function Test",
    status: "RECEIVED_AT_DISPATCH",
  },
];

const STATUS_SEQUENCE: SampleStatus[] = [
  "REGISTERED",
  "PROCESSING",
  "RESULT_PRODUCED",
  "AWAITING_DISPATCH",
  "RECEIVED_AT_DISPATCH",
  "COLLECTED",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function hoursAgo(min: number, max: number) {
  return new Date(NOW.getTime() - randomBetween(min, max) * 60 * 60 * 1000);
}

function lagosDatePart(date: Date) {
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

async function main() {
  console.log("Clearing existing LabFlow data...");
  await prisma.dispatchRecord.deleteMany();
  await prisma.workflowEvent.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const departmentSeeds = [
    {
      name: "Haematology & Blood Transfusion",
      description: "Blood counts, blood groups, malaria screening and transfusion work.",
    },
    {
      name: "Clinical Chemistry",
      description: "Chemistry panels, glucose, lipids, renal and liver function tests.",
    },
    {
      name: "Medical Microbiology",
      description: "Culture, sensitivity and microscopy investigations.",
    },
    {
      name: "Serology & Immunology",
      description: "Antigen, antibody and serological screening tests.",
    },
    {
      name: "Histopathology",
      description: "Tissue preparation and histopathology workflow.",
    },
  ];

  const departments = new Map<string, string>();
  for (const seed of departmentSeeds) {
    const department = await prisma.department.create({ data: seed });
    departments.set(seed.name, department.id);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const haematology = departments.get("Haematology & Blood Transfusion")!;
  const chemistry = departments.get("Clinical Chemistry")!;
  const microbiology = departments.get("Medical Microbiology")!;
  const serology = departments.get("Serology & Immunology")!;

  const userSeeds: Array<{
    name: string;
    email: string;
    role: Role;
    departmentId: string | null;
  }> = [
    {
      name: "Amina Bello",
      email: "admin@labflow.test",
      role: "ADMIN",
      departmentId: haematology,
    },
    {
      name: "Dr. Chinedu Okafor",
      email: "scientist@labflow.test",
      role: "SCIENTIST",
      departmentId: chemistry,
    },
    {
      name: "Tunde Adeyemi",
      email: "intern@labflow.test",
      role: "INTERN",
      departmentId: haematology,
    },
    {
      name: "Ngozi Eze",
      email: "dispatch@labflow.test",
      role: "DISPATCH",
      departmentId: null,
    },
    {
      name: "Dr. Fatima Yusuf",
      email: "scientist2@labflow.test",
      role: "SCIENTIST",
      departmentId: microbiology,
    },
    {
      name: "Blessing Okonkwo",
      email: "intern2@labflow.test",
      role: "INTERN",
      departmentId: chemistry,
    },
    {
      name: "Emeka Nwosu",
      email: "dispatch2@labflow.test",
      role: "DISPATCH",
      departmentId: null,
    },
    {
      name: "Dr. Halima Sanusi",
      email: "scientist3@labflow.test",
      role: "SCIENTIST",
      departmentId: serology,
    },
  ];

  const users: Array<{
    id: string;
    name: string;
    role: Role;
    departmentId: string | null;
  }> = [];

  for (const seed of userSeeds) {
    const user = await prisma.user.create({
      data: { ...seed, passwordHash, isActive: true },
      select: { id: true, name: true, role: true, departmentId: true },
    });
    users.push(user);
  }

  const admin = users.find((user) => user.role === "ADMIN")!;
  const interns = users.filter((user) => user.role === "INTERN");
  const scientists = users.filter((user) => user.role === "SCIENTIST");
  const dispatchStaff = users.filter((user) => user.role === "DISPATCH");
  const handlers = [...interns, ...scientists, admin];

  const accessionCounters = new Map<string, number>();

  for (const seed of SAMPLES) {
    const catalog = TEST_CATALOG[seed.test];
    const targetIndex = STATUS_SEQUENCE.indexOf(seed.status);
    const createdAt = hoursAgo(
      ...({
        REGISTERED: [1, 20],
        PROCESSING: [8, 36],
        RESULT_PRODUCED: [16, 48],
        AWAITING_DISPATCH: [24, 72],
        RECEIVED_AT_DISPATCH: [40, 96],
        COLLECTED: [60, 180],
      }[seed.status] as [number, number]),
    );

    const steps: Array<{
      status: SampleStatus;
      at: Date;
      performedById: string;
      note: string;
    }> = [];

    const registrar = handlers[Math.floor(Math.random() * handlers.length)];
    steps.push({
      status: "REGISTERED",
      at: createdAt,
      performedById: registrar.id,
      note: "Sample received in good condition and registered at reception.",
    });

    let cursor = createdAt;
    if (targetIndex >= 1) {
      cursor = addMinutes(cursor, randomBetween(15, 45));
      steps.push({
        status: "PROCESSING",
        at: cursor,
        performedById:
          handlers[Math.floor(Math.random() * handlers.length)].id,
        note: "Sample checked and accepted for processing.",
      });
    }
    if (targetIndex >= 2) {
      cursor = addMinutes(cursor, randomBetween(60, 180));
      steps.push({
        status: "RESULT_PRODUCED",
        at: cursor,
        performedById:
          scientists[Math.floor(Math.random() * scientists.length)].id,
        note: "Result produced and entered into the laboratory record.",
      });
    }
    if (targetIndex >= 3) {
      cursor = addMinutes(cursor, randomBetween(15, 40));
      steps.push({
        status: "AWAITING_DISPATCH",
        at: cursor,
        performedById:
          handlers[Math.floor(Math.random() * handlers.length)].id,
        note: "Result verified and handed to the dispatch queue.",
      });
    }
    if (targetIndex >= 4) {
      cursor = addMinutes(cursor, randomBetween(20, 60));
      steps.push({
        status: "RECEIVED_AT_DISPATCH",
        at: cursor,
        performedById:
          dispatchStaff[Math.floor(Math.random() * dispatchStaff.length)].id,
        note: "Result received and acknowledged at the dispatch desk.",
      });
    }
    if (targetIndex >= 5) {
      cursor = addMinutes(cursor, randomBetween(120, 720));
      steps.push({
        status: "COLLECTED",
        at: cursor,
        performedById:
          dispatchStaff[Math.floor(Math.random() * dispatchStaff.length)].id,
        note: "Result collected by the patient at the dispatch desk.",
      });
    }

    const datePart = lagosDatePart(createdAt);
    const nextCount = (accessionCounters.get(datePart) ?? 0) + 1;
    accessionCounters.set(datePart, nextCount);
    const accessionNumber = `LF-${datePart}-${String(nextCount).padStart(4, "0")}`;

    const sample = await prisma.sample.create({
      data: {
        accessionNumber,
        patientIdentifier: seed.patientIdentifier,
        patientName: seed.patientName,
        sampleType: catalog.sampleType,
        requestedTest: seed.test,
        status: seed.status,
        departmentId: departments.get(catalog.department)!,
        registeredById: registrar.id,
        createdAt,
        updatedAt: cursor,
        workflowEvents: {
          create: steps.map((step, index) => ({
            previousStatus: index === 0 ? null : steps[index - 1].status,
            newStatus: step.status,
            performedById: step.performedById,
            note: step.note,
            createdAt: step.at,
          })),
        },
      },
    });

    if (targetIndex >= 4) {
      const handover = steps[3];
      const receipt = steps[4];
      const collection = steps[5];

      await prisma.dispatchRecord.create({
        data: {
          sampleId: sample.id,
          handedOverById: handover.performedById,
          receivedById: receipt.performedById,
          collectedById: collection?.performedById ?? null,
          dispatchedAt: handover.at,
          receivedAt: receipt.at,
          collectedAt: collection?.at ?? null,
          notes:
            targetIndex >= 5
              ? "Handover completed and patient collection recorded."
              : "Received at dispatch and awaiting patient collection.",
        },
      });
    }
  }

  console.log(
    `Seeded ${departmentSeeds.length} departments, ${users.length} users and ${SAMPLES.length} samples.`,
  );
  console.log(`Demo password for all accounts: ${DEMO_PASSWORD}`);
  console.log("Admin:      admin@labflow.test");
  console.log("Scientist:  scientist@labflow.test");
  console.log("Intern:     intern@labflow.test");
  console.log("Dispatch:   dispatch@labflow.test");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
