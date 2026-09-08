import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/data/users";
import { createSessionCookie } from "@/lib/auth";
import { apiSuccess, apiError, serverError } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // 1. Presence check
    if (!body || !body.email) {
      return apiError("Email address is required for authentication.", 400);
    }

    const email = body.email.trim();
    const password = body.password?.trim();

    // 2. Format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Please provide a valid email address.", 400);
    }

    // 3. Business rule verification
    const user = await authenticateUser(email, password);
    if (!user) {
      return apiError("Invalid email or password credentials.", 401, "INVALID_CREDENTIALS");
    }

    const cookieHeader = createSessionCookie(user.email);
    return apiSuccess(
      { user },
      200,
      { "Set-Cookie": cookieHeader }
    );
  } catch (error) {
    return serverError(error, "Authentication process failed.");
  }
}
