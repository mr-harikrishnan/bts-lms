import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { ROLES } from '../constants/roles.js';
import { toObjectId } from '../utils/objectId.js';

export async function getAllCourses(filters: {
  category?: string | string[];
  categories?: string | string[];
  level?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  search?: string;
  sort?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}) {
  const query: Record<string, any> = {};

  // Handle single or multi-category filtering
  const rawCategories = filters.categories || filters.category;
  if (rawCategories) {
    let catArray: string[] = [];
    if (Array.isArray(rawCategories)) {
      catArray = rawCategories.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof rawCategories === 'string' && rawCategories.includes(',')) {
      catArray = rawCategories.split(',').map((c) => c.trim()).filter(Boolean);
    } else if (typeof rawCategories === 'string' && rawCategories !== 'All Tracks') {
      catArray = [rawCategories.trim()];
    }

    // Filter out 'All Tracks'
    catArray = catArray.filter((c) => c !== 'All Tracks');

    if (catArray.length === 1) {
      query.category = catArray[0];
    } else if (catArray.length > 1) {
      query.category = { $in: catArray };
    }
  }

  if (filters.level) {
    query.level = filters.level;
  }

  // Price range filtering
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      query.price.$lte = Number(filters.maxPrice);
    }
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

export async function getCourseWithFullCurriculum(
  courseId: string,
  requestingUser?: { _id: string; role: string }
) {
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

  let isAuthorized = course.price === 0;
  if (requestingUser) {
    if (requestingUser.role === ROLES.ADMIN) {
      isAuthorized = true;
    } else if (!isAuthorized) {
      const enrollment = await Enrollment.findOne({
        userId: toObjectId(requestingUser._id),
        courseId: oid,
      });
      if (enrollment) {
        isAuthorized = true;
      }
    }
  }

  const courseObj: any = course.toJSON();
  courseObj.modules = modules.map((m) => {
    const mObj: any = m.toJSON();
    mObj.lessons = lessons
      .filter((l) => l.moduleId.toString() === m._id.toString())
      .map((l) => {
        const lObj: any = l.toJSON();
        // Protect private video URLs from public curriculum preview
        if (!isAuthorized) {
          delete lObj.videoUrl;
        }
        return lObj;
      });
    return mObj;
  });

  return courseObj;
}

export async function getCourseModules(
  courseId: string,
  requestingUser?: { _id: string; role: string }
) {
  const oid = toObjectId(courseId);
  const course = await Course.findById(oid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const modules = await Module.find({ courseId: oid }).sort({ order: 1, moduleNumber: 1 });
  const lessons = await Lesson.find({ courseId: oid }).sort({ order: 1, lessonNumber: 1 });

  let isAuthorized = course.price === 0;
  if (requestingUser) {
    if (requestingUser.role === ROLES.ADMIN) {
      isAuthorized = true;
    } else if (!isAuthorized) {
      const enrollment = await Enrollment.findOne({
        userId: toObjectId(requestingUser._id),
        courseId: oid,
      });
      if (enrollment) {
        isAuthorized = true;
      }
    }
  }

  return modules.map((m) => {
    const mObj: any = m.toJSON();
    mObj.lessons = lessons
      .filter((l) => l.moduleId.toString() === m._id.toString())
      .map((l) => {
        const lObj: any = l.toJSON();
        if (!isAuthorized) {
          delete lObj.videoUrl;
        }
        return lObj;
      });
    return mObj;
  });
}

export async function getCourseLessons(
  courseId: string,
  userId: string,
  userRole: string
) {
  const oid = toObjectId(courseId);
  const course = await Course.findById(oid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Enforce enrollment verification for paid courses
  if (course.price > 0 && userRole !== ROLES.ADMIN) {
    const enrollment = await Enrollment.findOne({
      userId: toObjectId(userId),
      courseId: oid,
    });
    if (!enrollment) {
      const error: any = new Error(
        'Forbidden: You must be actively enrolled in this course to access lessons.'
      );
      error.statusCode = 403;
      throw error;
    }
  }

  return Lesson.find({ courseId: oid }).sort({ order: 1, lessonNumber: 1 });
}

export async function getSingleLesson(
  courseId: string,
  lessonId: string,
  userId: string,
  userRole: string
) {
  const courseOid = toObjectId(courseId);
  const lessonOid = toObjectId(lessonId);

  const course = await Course.findById(courseOid);
  if (!course) {
    const error: any = new Error(`Course with ID '${courseId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Cross-course ID validation: verify lesson belongs to requested course
  const lesson = await Lesson.findOne({
    _id: lessonOid,
    courseId: courseOid,
  });
  if (!lesson) {
    const error: any = new Error(`Lesson with ID '${lessonId}' not found in course '${courseId}'.`);
    error.statusCode = 404;
    throw error;
  }

  // Enforce enrollment verification for paid courses
  if (course.price > 0 && userRole !== ROLES.ADMIN) {
    const enrollment = await Enrollment.findOne({
      userId: toObjectId(userId),
      courseId: courseOid,
    });
    if (!enrollment) {
      const error: any = new Error(
        'Forbidden: You must be actively enrolled in this course to access this lesson.'
      );
      error.statusCode = 403;
      throw error;
    }
  }

  return lesson;
}

export async function getModuleById(
  moduleId: string,
  userId?: string,
  userRole?: string
) {
  const mod = await Module.findById(toObjectId(moduleId));
  if (!mod) {
    const error: any = new Error(`Module with ID '${moduleId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(mod.courseId);
  let isAuthorized = course ? course.price === 0 : false;
  if (userId && course) {
    if (userRole === ROLES.ADMIN) {
      isAuthorized = true;
    } else if (!isAuthorized) {
      const enrollment = await Enrollment.findOne({
        userId: toObjectId(userId),
        courseId: course._id,
      });
      if (enrollment) {
        isAuthorized = true;
      }
    }
  }

  const lessons = await Lesson.find({ moduleId: mod._id }).sort({ order: 1, lessonNumber: 1 });
  const mObj: any = mod.toJSON();
  mObj.lessons = lessons.map((l) => {
    const lObj: any = l.toJSON();
    if (!isAuthorized) {
      delete lObj.videoUrl;
    }
    return lObj;
  });
  return mObj;
}

export async function getLessonById(
  lessonId: string,
  userId: string,
  userRole: string
) {
  const lessonOid = toObjectId(lessonId);
  const lesson = await Lesson.findById(lessonOid);
  if (!lesson) {
    const error: any = new Error(`Lesson with ID '${lessonId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  const course = await Course.findById(lesson.courseId);
  if (!course) {
    const error: any = new Error('Associated course was not found.');
    error.statusCode = 404;
    throw error;
  }

  if (course.price > 0 && userRole !== ROLES.ADMIN) {
    const enrollment = await Enrollment.findOne({
      userId: toObjectId(userId),
      courseId: lesson.courseId,
    });
    if (!enrollment) {
      const error: any = new Error(
        'Forbidden: You must be actively enrolled in this course to access this lesson.'
      );
      error.statusCode = 403;
      throw error;
    }
  }

  return lesson;
}
