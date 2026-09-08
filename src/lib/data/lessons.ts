import { Lesson } from "@/types";
import { readJsonFile } from "./storage";

interface StoredLesson extends Lesson {
  courseId: string;
  moduleId: string;
  order: number;
}

export async function getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
  if (!courseId) {
    return [];
  }

  const allLessons = await readJsonFile<StoredLesson[]>("lessons.json");
  return allLessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export async function getLessonById(
  lessonId: string,
  courseId?: string
): Promise<Lesson | null> {
  if (!lessonId) {
    return null;
  }

  const allLessons = await readJsonFile<StoredLesson[]>("lessons.json");
  const match = allLessons.find((l) => {
    const idMatch = l._id === lessonId;
    if (!idMatch) return false;
    return courseId ? l.courseId === courseId : true;
  });

  return match || null;
}
