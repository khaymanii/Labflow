import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { sampleCreateSchema } from "@/lib/validations";
import { createSample } from "@/lib/services/samples";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await readJson(request);
    const input = sampleCreateSchema.parse(payload);
    const sample = await createSample(input, user);

    return NextResponse.json({ sample }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
