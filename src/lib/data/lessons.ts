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
  courseId: string,
  lessonId: string
): Promise<Lesson | null> {
  if (!courseId || !lessonId) {
    return null;
  }

  const allLessons = await readJsonFile<StoredLesson[]>("lessons.json");
  const match = allLessons.find(
    (l) => l.courseId === courseId && l.id === lessonId
  );
  return match || null;
}
