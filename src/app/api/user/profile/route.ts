import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { updateUser } from "@/lib/data/users";
import {
  apiSuccess,
  apiError,
  unauthorizedError,
  serverError,
} from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    return apiSuccess(user);
  } catch (error) {
    return serverError(error, "Failed to retrieve user profile.");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return apiError("Request body is required.", 400);
    }

    const updated = await updateUser(user.email, {
      name: body.name,
      college: body.college,
      district: body.district,
      state: body.state,
      avatar: body.avatar,
    });

    if (!updated) {
      return apiError("Unable to update profile.", 400);
    }

    return apiSuccess(updated);
  } catch (error) {
    return serverError(error, "Failed to update user profile.");
  }
}
