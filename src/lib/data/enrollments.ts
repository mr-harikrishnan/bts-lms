import { EnrolledCourseProgress, CourseProgressSummary } from "@/types";
import { readJsonFile, writeJsonFile } from "./storage";
import { getCourseById } from "./courses";

export async function getUserEnrollments(
  userEmail: string
): Promise<EnrolledCourseProgress[]> {
  if (!userEmail) {
    return [];
  }

  const enrollments = await readJsonFile<EnrolledCourseProgress[]>("enrollments.json");
  return enrollments.filter(
    (e) => e.userEmail?.toLowerCase() === userEmail.trim().toLowerCase()
  );
}

export async function getUserCourseProgress(
  userEmail: string,
  courseId: string
): Promise<{
  enrollment: EnrolledCourseProgress;
  progress: CourseProgressSummary;
} | null> {
  if (!userEmail || !courseId) {
    return null;
  }

  const userEnrollments = await getUserEnrollments(userEmail);
  const enrollment = userEnrollments.find((e) => e.courseId === courseId);
  if (!enrollment) {
    return null;
  }

  const course = await getCourseById(courseId);
  const totalCount =
    course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedCount = enrollment.completedLessonIds.length;
  const percentage =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return {
    enrollment,
    progress: {
      completedCount,
      totalCount,
      percentage,
    },
  };
}

export async function enrollUserInCourse(
  userEmail: string,
  courseId: string
): Promise<EnrolledCourseProgress> {
  if (!userEmail || !courseId) {
    throw new Error("User email and courseId are required for enrollment.");
  }

  const enrollments = await readJsonFile<EnrolledCourseProgress[]>("enrollments.json");
  const existing = enrollments.find(
    (e) =>
      e.userEmail?.toLowerCase() === userEmail.trim().toLowerCase() &&
      e.courseId === courseId
  );

  if (existing) {
    return existing;
  }

  const course = await getCourseById(courseId);
  const firstLessonId = course?.modules?.[0]?.lessons?.[0]?.id || "lesson-1-1";

  const newEnrollment: EnrolledCourseProgress = {
    userEmail: userEmail.trim().toLowerCase(),
    courseId,
    enrolledAt: new Date().toISOString().split("T")[0],
    completedLessonIds: [],
    currentLessonId: firstLessonId,
    isCompleted: false,
  };

  enrollments.push(newEnrollment);
  await writeJsonFile<EnrolledCourseProgress[]>("enrollments.json", enrollments);

  return newEnrollment;
}

export async function markLessonComplete(
  userEmail: string,
  courseId: string,
  lessonId: string
): Promise<EnrolledCourseProgress | null> {
  if (!userEmail || !courseId || !lessonId) {
    return null;
  }

  const enrollments = await readJsonFile<EnrolledCourseProgress[]>("enrollments.json");
  const index = enrollments.findIndex(
    (e) =>
      e.userEmail?.toLowerCase() === userEmail.trim().toLowerCase() &&
      e.courseId === courseId
  );

  if (index === -1) {
    // Auto enroll if accessing directly
    await enrollUserInCourse(userEmail, courseId);
    return markLessonComplete(userEmail, courseId, lessonId);
  }

  const current = enrollments[index];
  const set = new Set(current.completedLessonIds);
  set.add(lessonId);
  const completedLessonIds = Array.from(set);

  const course = await getCourseById(courseId);
  const totalCount =
    course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const isCompleted = totalCount > 0 && completedLessonIds.length >= totalCount;

  const updated: EnrolledCourseProgress = {
    ...current,
    completedLessonIds,
    isCompleted: isCompleted || current.isCompleted,
  };

  enrollments[index] = updated;
  await writeJsonFile<EnrolledCourseProgress[]>("enrollments.json", enrollments);

  return updated;
}

export async function updateCurrentLesson(
  userEmail: string,
  courseId: string,
  lessonId: string
): Promise<EnrolledCourseProgress | null> {
  if (!userEmail || !courseId || !lessonId) {
    return null;
  }

  const enrollments = await readJsonFile<EnrolledCourseProgress[]>("enrollments.json");
  const index = enrollments.findIndex(
    (e) =>
      e.userEmail?.toLowerCase() === userEmail.trim().toLowerCase() &&
      e.courseId === courseId
  );

  if (index === -1) {
    return null;
  }

  enrollments[index] = {
    ...enrollments[index],
    currentLessonId: lessonId,
  };

  await writeJsonFile<EnrolledCourseProgress[]>("enrollments.json", enrollments);
  return enrollments[index];
}

export async function updateEnrollmentTestResult(
  userEmail: string,
  courseId: string,
  score: number,
  passed: boolean,
  certificateId?: string
): Promise<EnrolledCourseProgress | null> {
  const enrollments = await readJsonFile<EnrolledCourseProgress[]>("enrollments.json");
  const index = enrollments.findIndex(
    (e) =>
      e.userEmail?.toLowerCase() === userEmail.trim().toLowerCase() &&
      e.courseId === courseId
  );

  if (index === -1) {
    return null;
  }

  const updated: EnrolledCourseProgress = {
    ...enrollments[index],
    testScore: score,
    testPassed: passed,
    isCompleted: passed ? true : enrollments[index].isCompleted,
    certificateId: certificateId || enrollments[index].certificateId,
  };

  enrollments[index] = updated;
  await writeJsonFile<EnrolledCourseProgress[]>("enrollments.json", enrollments);
  return updated;
}
