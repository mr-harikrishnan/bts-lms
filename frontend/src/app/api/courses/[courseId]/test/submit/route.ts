import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { gradeCourseTest } from "@/lib/data/tests";
import { getCourseById } from "@/lib/data/courses";
import {
  apiSuccess,
  apiError,
  notFoundError,
  unauthorizedError,
  serverError,
  invalidObjectIdError,
} from "@/lib/apiResponse";
import { isValidObjectId } from "@/lib/objectId";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    if (!isValidObjectId(courseId)) {
      return invalidObjectIdError("courseId");
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError("Please sign in to submit your certification assessment.");
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return notFoundError(`Course with ID '${courseId}' was not found.`);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.answers !== "object") {
      return apiError("Submitted answers must be an object map of question IDs.", 400);
    }

    const result = await gradeCourseTest(user.email, courseId, body.answers);
    return apiSuccess(result, 200);
  } catch (error) {
    return serverError(error, "Failed to submit and grade assessment.");
  }
}
