import { NextResponse } from "next/server";
import { requireApiRole, requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { userCreateSchema } from "@/lib/validations";
import { createUser } from "@/lib/services/users";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    requireApiRole(user, ["ADMIN"]);

    const payload = await readJson(request);
    const input = userCreateSchema.parse(payload);
    const created = await createUser(input);

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
