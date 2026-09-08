import { NextRequest } from "next/server";
import { getLessonById } from "@/lib/data/lessons";
import { apiSuccess, notFoundError, serverError } from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    const lesson = await getLessonById(courseId, lessonId);

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
