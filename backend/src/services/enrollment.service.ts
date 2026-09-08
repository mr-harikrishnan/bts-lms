import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { toObjectId } from '../utils/objectId.js';

export async function getUserEnrollments(userId: string) {
  const userOid = toObjectId(userId);
  const enrollments = await Enrollment.find({ userId: userOid }).populate('courseId');
  return enrollments;
}

export async function getUserCourseProgress(userId: string, courseId: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);

  const [enrollment, totalLessons] = await Promise.all([
    Enrollment.findOne({ userId: userOid, courseId: courseOid }),
    Lesson.countDocuments({ courseId: courseOid }),
  ]);

  if (!enrollment) {
    return null;
  }

  const completedCount = enrollment.completedLessonIds.length;
  const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  return {
    enrollment,
    progress: {
      completedCount,
      totalCount: totalLessons,
      percentage,
    },
  };
}

export async function updateCurrentLesson(userId: string, courseId: string, lessonId: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);
  const lessonOid = toObjectId(lessonId);

  const enrollment = await Enrollment.findOneAndUpdate(
    { userId: userOid, courseId: courseOid },
    { currentLessonId: lessonOid },
    { new: true }
  );

  if (!enrollment) {
    const error: any = new Error('Enrollment not found for this course.');
    error.statusCode = 404;
    throw error;
  }

  return enrollment;
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);
  const lessonOid = toObjectId(lessonId);

  const totalLessons = await Lesson.countDocuments({ courseId: courseOid });

  let enrollment = await Enrollment.findOne({ userId: userOid, courseId: courseOid });
  if (!enrollment) {
    const error: any = new Error('User is not enrolled in this course.');
    error.statusCode = 404;
    throw error;
  }

  const completedSet = new Set(enrollment.completedLessonIds.map((id) => id.toString()));
  completedSet.add(lessonOid!.toString());

  const completedArray = Array.from(completedSet).map((id) => toObjectId(id)!);
  const isAllComplete = totalLessons > 0 && completedArray.length >= totalLessons;

  enrollment.completedLessonIds = completedArray;
  enrollment.currentLessonId = lessonOid!;
  if (isAllComplete) {
    enrollment.isCompleted = true;
  }

  await enrollment.save();
  return enrollment;
}

export async function enrollUser(userId: string, courseId: string) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);

  const course = await Course.findById(courseOid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const existing = await Enrollment.findOne({ userId: userOid, courseId: courseOid });
  if (existing) {
    return existing;
  }

  const firstLesson = await Lesson.findOne({ courseId: courseOid }).sort({ order: 1, lessonNumber: 1 });

  const enrollment = await Enrollment.create({
    userId: userOid,
    courseId: courseOid,
    enrolledAt: new Date(),
    completedLessonIds: [],
    currentLessonId: firstLesson?._id,
    isCompleted: false,
  });

  return enrollment;
}
