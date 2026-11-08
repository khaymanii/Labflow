import { NextResponse } from "next/server";
import { requireApiRole, requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { userUpdateSchema } from "@/lib/validations";
import { updateUser } from "@/lib/services/users";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    requireApiRole(user, ["ADMIN"]);

    const { id } = await context.params;
    const payload = await readJson(request);
    const input = userUpdateSchema.parse(payload);
    const updated = await updateUser(id, input, user);

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
