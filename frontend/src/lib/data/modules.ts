import { CourseModule, Lesson } from "@/types";
import { readJsonFile } from "./storage";
import { getLessonsByCourseId } from "./lessons";

interface StoredModule {
  _id: string;
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
    _id: m._id,
    courseId: m.courseId,
    moduleNumber: m.moduleNumber,
    title: m.title,
    lessons: courseLessons.filter(
      (l) => (l as Lesson & { moduleId?: string }).moduleId === m._id
    ),
  }));
}

export async function getModuleById(
  moduleId: string,
  courseId?: string
): Promise<CourseModule | null> {
  if (!moduleId) {
    return null;
  }

  const allModules = await readJsonFile<StoredModule[]>("modules.json");
  const found = allModules.find(
    (m) => m._id === moduleId && (courseId ? m.courseId === courseId : true)
  );

  if (!found) {
    return null;
  }

  const courseLessons = await getLessonsByCourseId(found.courseId);

  return {
    _id: found._id,
    courseId: found.courseId,
    moduleNumber: found.moduleNumber,
    title: found.title,
    lessons: courseLessons.filter(
      (l) => (l as Lesson & { moduleId?: string }).moduleId === found._id
    ),
  };
}
