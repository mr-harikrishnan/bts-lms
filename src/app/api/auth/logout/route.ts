import { clearSessionCookie } from "@/lib/auth";
import { apiSuccess, serverError } from "@/lib/apiResponse";

export async function POST() {
  try {
    const cookieHeader = clearSessionCookie();
    return apiSuccess(
      { message: "Logged out successfully" },
      200,
      { "Set-Cookie": cookieHeader }
    );
  } catch (error) {
    return serverError(error, "Failed to terminate user session.");
  }
}
