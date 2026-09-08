import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateCertificate } from "@/lib/data/certificates";
import { getUserCourseProgress } from "@/lib/data/enrollments";
import {
  apiSuccess,
  apiError,
  unauthorizedError,
  serverError,
} from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.courseId) {
      return apiError("Field 'courseId' is required.", 400);
    }

    const progressData = await getUserCourseProgress(user.email, body.courseId);
    if (!progressData) {
      return apiError("User is not enrolled in this course.", 400);
    }

    // Default test score if already passed, or calculate from enrollment
    const score = progressData.enrollment.testScore || 90;
    const cert = await generateCertificate(user.email, body.courseId, score);

    return apiSuccess(cert, 201);
  } catch (error) {
    return serverError(error, "Failed to generate certificate.");
  }
}
