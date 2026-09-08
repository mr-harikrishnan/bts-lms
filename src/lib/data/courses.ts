import { Course } from "@/types";
import { readJsonFile } from "./storage";
import { getModulesByCourseId } from "./modules";

export interface CourseFilterParams {
  category?: string;
  level?: string;
  duration?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export async function getCourses(filters?: CourseFilterParams): Promise<Course[]> {
  const baseCourses = await readJsonFile<Omit<Course, "modules">[]>("courses.json");

  let result = await Promise.all(
    baseCourses.map(async (c) => {
      const modules = await getModulesByCourseId(c.id);
      return {
        ...c,
        modules,
      } as Course;
    })
  );

  if (!filters) {
    return result;
  }

  // 1. Category Filter
  if (filters.category && filters.category !== "All Tracks") {
    result = result.filter((c) => c.category === filters.category);
  }

  // 2. Level Filter
  if (filters.level) {
    result = result.filter((c) => c.level === filters.level);
  }

  // 3. Duration Filter
  if (filters.duration === "short") {
    result = result.filter((c) => c.durationWeeks <= 8);
  } else if (filters.duration === "medium") {
    result = result.filter((c) => c.durationWeeks >= 8 && c.durationWeeks <= 12);
  } else if (filters.duration === "long") {
    result = result.filter((c) => c.durationWeeks >= 13);
  }

  // 4. Featured Filter
  if (filters.featured !== undefined) {
    result = result.filter((c) => !!c.featured === filters.featured);
  }

  // 5. Search Filter
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const descMatch = c.description.toLowerCase().includes(q);
      const skillMatch = c.skills?.some((s) => s.toLowerCase().includes(q));
      return titleMatch || descMatch || skillMatch;
    });
  }

  // 6. Sort
  if (filters.sort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (filters.sort === "newest") {
    result.sort((a, b) => b.originalPrice - a.originalPrice);
  } else {
    // Default popular
    result.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  return result;
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  if (!courseId) {
    return null;
  }

  const baseCourses = await readJsonFile<Omit<Course, "modules">[]>("courses.json");
  const course = baseCourses.find((c) => c.id === courseId);
  if (!course) {
    return null;
  }

  const modules = await getModulesByCourseId(course.id);
  return {
    ...course,
    modules,
  } as Course;
}
