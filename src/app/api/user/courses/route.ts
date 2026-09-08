import { getAuthenticatedUser } from "@/lib/auth";
import { getUserEnrollments } from "@/lib/data/enrollments";
import { apiSuccess, unauthorizedError, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedError();
    }

    const enrollments = await getUserEnrollments(user.email);
    return apiSuccess(enrollments);
  } catch (error) {
    return serverError(error, "Failed to retrieve user course enrollments.");
  }
}
