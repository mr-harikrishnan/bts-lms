import { NextRequest } from "next/server";
import { getUserById } from "@/lib/data/users";
import {
  apiSuccess,
  notFoundError,
  serverError,
  invalidObjectIdError,
} from "@/lib/apiResponse";
import { isValidObjectId } from "@/lib/objectId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return invalidObjectIdError("id");
    }

    const user = await getUserById(id);
    if (!user) {
      return notFoundError(`User with ID '${id}' was not found.`);
    }

    return apiSuccess(user);
  } catch (error) {
    return serverError(error, "Failed to retrieve user profile.");
  }
}
