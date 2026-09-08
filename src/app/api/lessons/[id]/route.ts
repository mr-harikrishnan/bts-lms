import { NextRequest } from "next/server";
import { getLessonById } from "@/lib/data/lessons";
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

    const lesson = await getLessonById(id);
    if (!lesson) {
      return notFoundError(`Lesson with ID '${id}' was not found.`);
    }

    return apiSuccess(lesson);
  } catch (error) {
    return serverError(error, "Failed to retrieve lesson.");
  }
}
