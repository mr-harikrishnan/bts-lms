import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { enrollUserInCourse } from "@/lib/data/enrollments";
import { getCourseById } from "@/lib/data/courses";
import {
  apiSuccess,
  notFoundError,
  unauthorizedError,
  serverError,
} from "@/lib/apiResponse";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError("Please sign in to enroll in this course.");
    }

    const { courseId } = await params;
    const course = await getCourseById(courseId);
    if (!course) {
      return notFoundError(`Course with ID '${courseId}' was not found.`);
    }

    const enrollment = await enrollUserInCourse(user.email, courseId);
    return apiSuccess(enrollment, 201);
  } catch (error) {
    return serverError(error, "Failed to complete course enrollment.");
  }
}
