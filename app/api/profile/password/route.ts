import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { handleRouteError, readJson } from "@/lib/api-errors";
import { passwordChangeSchema } from "@/lib/validations";
import { changePassword } from "@/lib/services/users";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = await readJson(request);
    const input = passwordChangeSchema.parse(payload);
    await changePassword(user.id, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
