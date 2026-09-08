import { CourseModule, Lesson } from "@/types";
import { readJsonFile } from "./storage";
import { getLessonsByCourseId } from "./lessons";

interface StoredModule {
  id: string;
  courseId: string;
  moduleNumber: string;
  title: string;
  order: number;
}

export async function getModulesByCourseId(courseId: string): Promise<CourseModule[]> {
  if (!courseId) {
    return [];
  }

  const allModules = await readJsonFile<StoredModule[]>("modules.json");
  const courseModules = allModules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const courseLessons = await getLessonsByCourseId(courseId);

  return courseModules.map((m) => ({
    id: m.id,
    moduleNumber: m.moduleNumber,
    title: m.title,
    lessons: courseLessons.filter(
      (l) => (l as Lesson & { moduleId: string }).moduleId === m.id
    ),
  }));
}

export async function getModuleById(
  courseId: string,
  moduleId: string
): Promise<CourseModule | null> {
  if (!courseId || !moduleId) {
    return null;
  }

  const modules = await getModulesByCourseId(courseId);
  const found = modules.find((m) => m.id === moduleId);
  return found || null;
}
