import { NextRequest } from "next/server";
import { getModuleById } from "@/lib/data/modules";
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

    const moduleRecord = await getModuleById(id);
    if (!moduleRecord) {
      return notFoundError(`Module with ID '${id}' was not found.`);
    }

    return apiSuccess(moduleRecord);
  } catch (error) {
    return serverError(error, "Failed to retrieve module.");
  }
}
