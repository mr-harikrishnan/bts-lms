import { NextRequest } from "next/server";
import { getModulesByCourseId } from "@/lib/data/modules";
import { getCourseById } from "@/lib/data/courses";
import { apiSuccess, notFoundError, serverError } from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await getCourseById(courseId);

    if (!course) {
      return notFoundError(`Course with ID '${courseId}' was not found.`);
    }

    const modules = await getModulesByCourseId(courseId);
    return apiSuccess(modules);
  } catch (error) {
    return serverError(error, "Failed to retrieve course modules.");
  }
}
