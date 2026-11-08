import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { profileUpdateSchema } from "@/lib/validations";
import { updateProfile } from "@/lib/services/users";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await readJson(request);
    const input = profileUpdateSchema.parse(payload);
    const updated = await updateProfile(user.id, input);

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
