import { getAuthenticatedUser } from "@/lib/auth";
import { apiSuccess, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return apiSuccess({ user });
  } catch (error) {
    return serverError(error, "Failed to resolve active user session.");
  }
}
