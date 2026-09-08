import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCourseTest } from "@/lib/data/tests";
import { getCourseById } from "@/lib/data/courses";
import {
  apiSuccess,
  notFoundError,
  unauthorizedError,
  serverError,
  invalidObjectIdError,
} from "@/lib/apiResponse";
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

    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError("Please sign in to access the certification assessment.");
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return notFoundError(`Course with ID '${courseId}' was not found.`);
    }

    const test = await getCourseTest(courseId, true);
    if (!test) {
      return notFoundError(`Assessment for course '${courseId}' was not found.`);
    }

    return apiSuccess(test);
  } catch (error) {
    return serverError(error, "Failed to retrieve assessment data.");
  }
}
