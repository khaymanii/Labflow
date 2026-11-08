import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";

export function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields.",
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      },
      { status: 422 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with these details already exists.", code: "CONFLICT" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "The requested record was not found.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
  }

  console.error("[labflow] Unhandled API error:", error);
  return NextResponse.json(
    { error: "An unexpected server error occurred.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new AppError("Request body must be valid JSON.", 400);
  }
}
