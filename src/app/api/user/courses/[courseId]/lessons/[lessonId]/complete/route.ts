import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { markLessonComplete } from "@/lib/data/enrollments";
import {
  apiSuccess,
  notFoundError,
  unauthorizedError,
  serverError,
} from "@/lib/apiResponse";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const { courseId, lessonId } = await params;
    const updated = await markLessonComplete(user.email, courseId, lessonId);

    if (!updated) {
      return notFoundError(
        `Unable to mark lesson '${lessonId}' complete for course '${courseId}'.`
      );
    }

    return apiSuccess(updated);
  } catch (error) {
    return serverError(error, "Failed to mark lesson complete.");
  }
}
