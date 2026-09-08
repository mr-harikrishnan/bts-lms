import { NextRequest } from "next/server";
import { createUser } from "@/lib/data/users";
import { createSessionCookie } from "@/lib/auth";
import { apiSuccess, apiError, serverError } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // 1. Presence check
    if (!body || !body.name || !body.email) {
      return apiError("Name and email are required for registration.", 400);
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const password = body.password?.trim();

    // 2. Format checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Please provide a valid email address.", 400);
    }

    if (password && password.length < 6) {
      return apiError("Password must be at least 6 characters.", 400);
    }

    // 3. Create user
    try {
      const user = await createUser({
        name,
        email,
        college: body.college,
        district: body.district,
        state: body.state,
        password,
      });

      const cookieHeader = createSessionCookie(user.email);
      return apiSuccess(
        { user },
        201,
        { "Set-Cookie": cookieHeader }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Account registration failed.";
      return apiError(message, 400);
    }
  } catch (error) {
    return serverError(error, "Account registration failed.");
  }
}
