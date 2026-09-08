import { NextRequest } from "next/server";
import { getCourses, CourseFilterParams } from "@/lib/data/courses";
import { apiSuccess, serverError } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: CourseFilterParams = {
      category: searchParams.get("category") || undefined,
      level: searchParams.get("level") || undefined,
      duration: searchParams.get("duration") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined,
      featured: searchParams.has("featured")
        ? searchParams.get("featured") === "true"
        : undefined,
    };

    const courses = await getCourses(filters);
    return apiSuccess(courses);
  } catch (error) {
    return serverError(error, "Failed to retrieve courses catalog.");
  }
}
