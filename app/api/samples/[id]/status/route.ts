import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { workflowTransitionSchema } from "@/lib/validations";
import { transitionSample } from "@/lib/services/samples";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await context.params;
    const payload = await readJson(request);
    const input = workflowTransitionSchema.parse(payload);
    const result = await transitionSample(id, input.toStatus, input.note, user);

    return NextResponse.json({ result });
  } catch (error) {
    return handleRouteError(error);
  }
}
