import { NextRequest } from "next/server";
import { getLessonById } from "@/lib/data/lessons";
import { apiSuccess, notFoundError, serverError, invalidObjectIdError } from "@/lib/apiResponse";
import { isValidObjectId } from "@/lib/objectId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    if (!isValidObjectId(courseId)) {
      return invalidObjectIdError("courseId");
    }
    if (!isValidObjectId(lessonId)) {
      return invalidObjectIdError("lessonId");
    }

    const lesson = await getLessonById(lessonId, courseId);
    if (!lesson) {
      return notFoundError(
        `Lesson with ID '${lessonId}' was not found in course '${courseId}'.`
      );
    }

    return apiSuccess(lesson);
  } catch (error) {
    return serverError(error, "Failed to retrieve lesson details.");
  }
}
