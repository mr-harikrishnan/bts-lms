import { NextRequest } from "next/server";
import { getLessonsByCourseId } from "@/lib/data/lessons";
import { getCourseById } from "@/lib/data/courses";
import { apiSuccess, notFoundError, serverError, invalidObjectIdError } from "@/lib/apiResponse";
import { isValidObjectId } from "@/lib/objectId";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    if (!isValidObjectId(courseId)) {
      return invalidObjectIdError("courseId");
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return notFoundError(`Course with ID '${courseId}' was not found.`);
    }

    const lessons = await getLessonsByCourseId(courseId);
    return apiSuccess(lessons);
  } catch (error) {
    return serverError(error, "Failed to retrieve course lessons.");
  }
}
