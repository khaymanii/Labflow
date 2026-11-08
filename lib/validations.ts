import { z } from "zod";
import { SAMPLE_TYPES } from "@/lib/constants";
import { Role, SampleStatus } from "@prisma/client";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const sampleCreateSchema = z.object({
  patientIdentifier: z
    .string()
    .trim()
    .min(2, "Patient identifier is required")
    .max(64, "Patient identifier is too long"),
  patientName: optionalText(120),
  sampleType: z.enum([...SAMPLE_TYPES] as [string, ...string[]], {
    message: "Select a sample type",
  }),
  requestedTest: z
    .string()
    .trim()
    .min(2, "Requested test is required")
    .max(120, "Requested test is too long"),
  departmentId: z.string().trim().min(1, "Select a laboratory department"),
  note: optionalText(500),
});

export const workflowTransitionSchema = z.object({
  toStatus: z.nativeEnum(SampleStatus),
  note: optionalText(500),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role),
  departmentId: z
    .string()
    .trim()
    .max(64)
    .nullish()
    .transform((value) => (value ? value : null)),
});

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.nativeEnum(Role).optional(),
    departmentId: z
      .string()
      .trim()
      .max(64)
      .nullable()
      .optional()
      .transform((value) => (value ? value : null)),
    isActive: z.boolean().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type SampleCreateInput = z.infer<typeof sampleCreateSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
