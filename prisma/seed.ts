import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  {
    name: "Haematology & Blood Transfusion",
    description:
      "Blood counts, blood groups, malaria screening and transfusion work.",
  },
  {
    name: "Clinical Chemistry",
    description:
      "Chemistry panels, glucose, lipids, renal and liver function tests.",
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

const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Laboratory Administrator";
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL?.trim() || "admin@labflow.local"
).toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";

async function main() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: { description: department.description },
      create: department,
    });
  }
  console.log(`Ensured ${DEPARTMENTS.length} laboratory departments.`);

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { email: true },
  });

  if (existingAdmin) {
    console.log(`Administrator already exists: ${existingAdmin.email}`);
    console.log("No accounts or samples were changed.");
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`Created administrator: ${ADMIN_EMAIL}`);
  if (process.env.ADMIN_PASSWORD) {
    console.log(
      "Use the password from ADMIN_PASSWORD in your .env, then change it under Settings.",
    );
  } else {
    console.log(
      "WARNING: ADMIN_PASSWORD was not set, so the default password was used.",
    );
    console.log("Sign in and change it under Settings before real use.");
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
