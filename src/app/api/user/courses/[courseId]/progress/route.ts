import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getUserCourseProgress,
  updateCurrentLesson,
} from "@/lib/data/enrollments";
import {
  apiSuccess,
  apiError,
  notFoundError,
  unauthorizedError,
  serverError,
} from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const { courseId } = await params;
    const progressData = await getUserCourseProgress(user.email, courseId);

    if (!progressData) {
      return notFoundError(
        `User is not enrolled in course '${courseId}' or course does not exist.`
      );
    }

    return apiSuccess(progressData);
  } catch (error) {
    return serverError(error, "Failed to retrieve course progress.");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const { courseId } = await params;
    const body = await request.json().catch(() => null);

    if (!body || !body.currentLessonId) {
      return apiError("Field 'currentLessonId' is required.", 400);
    }

    const updated = await updateCurrentLesson(
      user.email,
      courseId,
      body.currentLessonId
    );

    if (!updated) {
      return notFoundError(
        `Enrollment not found for course '${courseId}'.`
      );
    }

    return apiSuccess(updated);
  } catch (error) {
    return serverError(error, "Failed to update current lesson.");
  }
}
