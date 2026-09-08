import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { toObjectId } from '../utils/objectId.js';

export async function getAllCourses(filters: {
  category?: string;
  level?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}) {
  const query: Record<string, any> = {};

  if (filters.category && filters.category !== 'All Tracks') {
    query.category = filters.category;
  }
  if (filters.level) {
    query.level = filters.level;
  }
  if (filters.featured !== undefined) {
    query.featured = filters.featured;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { 'instructor.name': { $regex: filters.search, $options: 'i' } },
    ];
  }

  let sortCriteria: Record<string, any> = { createdAt: -1 };
  if (filters.sort === 'price-low') {
    sortCriteria = { price: 1 };
  } else if (filters.sort === 'price-high') {
    sortCriteria = { price: -1 };
  } else if (filters.sort === 'rating') {
    sortCriteria = { rating: -1 };
  } else if (filters.sort === 'popular') {
    sortCriteria = { reviewsCount: -1 };
  }

  const limit = filters.limit || 20;
  const page = filters.page || 1;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(query).sort(sortCriteria).skip(skip).limit(limit),
    Course.countDocuments(query),
  ]);

  return {
    courses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCourseWithFullCurriculum(courseId: string) {
  const oid = toObjectId(courseId);
  const course = await Course.findById(oid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const [modules, lessons] = await Promise.all([
    Module.find({ courseId: oid }).sort({ order: 1, moduleNumber: 1 }),
    Lesson.find({ courseId: oid }).sort({ order: 1, lessonNumber: 1 }),
  ]);

  const courseObj: any = course.toJSON();
  courseObj.modules = modules.map((m) => {
    const mObj: any = m.toJSON();
    mObj.lessons = lessons.filter((l) => l.moduleId.toString() === m._id.toString());
    return mObj;
  });

  return courseObj;
}

export async function getCourseModules(courseId: string) {
  const oid = toObjectId(courseId);
  const modules = await Module.find({ courseId: oid }).sort({ order: 1, moduleNumber: 1 });
  const lessons = await Lesson.find({ courseId: oid }).sort({ order: 1, lessonNumber: 1 });

  return modules.map((m) => {
    const mObj: any = m.toJSON();
    mObj.lessons = lessons.filter((l) => l.moduleId.toString() === m._id.toString());
    return mObj;
  });
}

export async function getCourseLessons(courseId: string) {
  const oid = toObjectId(courseId);
  return Lesson.find({ courseId: oid }).sort({ order: 1, lessonNumber: 1 });
}

export async function getSingleLesson(courseId: string, lessonId: string) {
  const lesson = await Lesson.findOne({
    _id: toObjectId(lessonId),
    courseId: toObjectId(courseId),
  });
  if (!lesson) {
    const error: any = new Error(`Lesson with ID '${lessonId}' not found in course '${courseId}'.`);
    error.statusCode = 404;
    throw error;
  }
  return lesson;
}

export async function getModuleById(moduleId: string) {
  const mod = await Module.findById(toObjectId(moduleId));
  if (!mod) {
    const error: any = new Error(`Module with ID '${moduleId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }
  const lessons = await Lesson.find({ moduleId: mod._id }).sort({ order: 1, lessonNumber: 1 });
  const mObj: any = mod.toJSON();
  mObj.lessons = lessons;
  return mObj;
}

export async function getLessonById(lessonId: string) {
  const lesson = await Lesson.findById(toObjectId(lessonId));
  if (!lesson) {
    const error: any = new Error(`Lesson with ID '${lessonId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }
  return lesson;
}
