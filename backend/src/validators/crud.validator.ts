import { ValidatorResult } from '../middleware/validation.middleware.js';
import { isValidObjectId } from '../utils/objectId.js';
import { ROLES } from '../constants/roles.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COURSE_CATEGORIES = ['Digital Marketing', 'Content Creation', 'Web Development'] as const;
const COURSE_LEVELS = ['Beginner-Friendly', 'Intermediate', 'Advanced'] as const;

// ---------------- COURSE VALIDATORS ----------------

export function validateCourseCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const {
    title,
    category,
    level,
    duration,
    price,
    description,
    thumbnail,
    originalPrice,
    instructor,
    durationWeeks,
    hoursLive,
    lessonCount,
    rating,
    reviewsCount,
    discountPercent,
    capstoneTitle,
    capstoneDesc,
    skills,
    featured,
    isUpcoming,
    videoUrl,
    previewVideoUrl,
  } = data;

  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 200) {
    errors.push("Course 'title' is required and must be between 3 and 200 characters.");
  }

  if (!category || typeof category !== 'string' || category.trim().length < 2) {
    errors.push("Course 'category' is required and must be at least 2 characters long.");
  }

  if (!level || !COURSE_LEVELS.includes(level)) {
    errors.push(`Course 'level' is required and must be one of: ${COURSE_LEVELS.join(', ')}.`);
  }

  if (!duration || typeof duration !== 'string' || duration.trim().length === 0) {
    errors.push("Course 'duration' is required (e.g. '12 Weeks (40 Hrs)').");
  }

  if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
    errors.push("Course 'price' is required and must be a non-negative number.");
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push("Course 'description' is required and must be at least 10 characters long.");
  }

  const sanitized: Record<string, any> = {
    title: title?.trim(),
    category,
    level,
    duration: duration?.trim(),
    price: Number(price),
    originalPrice: typeof originalPrice === 'number' && originalPrice >= 0 ? originalPrice : Number(price),
    description: description?.trim(),
    thumbnail: typeof thumbnail === 'string' && thumbnail.trim() ? thumbnail.trim() : '/assets/courses/default-course.jpg',
    instructor: {
      name: instructor?.name?.trim() || 'BTS Academy',
      title: instructor?.title?.trim() || 'Lead Instructor',
      avatar: instructor?.avatar?.trim() || '/assets/instructors/default.jpg',
    },
    durationWeeks: typeof durationWeeks === 'number' && durationWeeks >= 0 ? durationWeeks : 0,
    hoursLive: typeof hoursLive === 'number' && hoursLive >= 0 ? hoursLive : 0,
    lessonCount: typeof lessonCount === 'number' && lessonCount >= 0 ? lessonCount : 0,
    rating: typeof rating === 'number' && rating >= 0 && rating <= 5 ? rating : 4.8,
    reviewsCount: typeof reviewsCount === 'number' && reviewsCount >= 0 ? reviewsCount : 0,
    discountPercent: typeof discountPercent === 'number' && discountPercent >= 0 && discountPercent <= 100 ? discountPercent : 0,
    capstoneTitle: typeof capstoneTitle === 'string' ? capstoneTitle.trim() : '',
    capstoneDesc: typeof capstoneDesc === 'string' ? capstoneDesc.trim() : '',
    skills: Array.isArray(skills) ? skills.filter((s) => typeof s === 'string').map((s) => s.trim()) : [],
    featured: Boolean(featured),
    isUpcoming: Boolean(isUpcoming),
    videoUrl: typeof videoUrl === 'string' ? videoUrl.trim() : '',
    previewVideoUrl: typeof previewVideoUrl === 'string' ? previewVideoUrl.trim() : '',
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateCourseUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 3 || data.title.trim().length > 200) {
      errors.push("Course 'title' must be between 3 and 200 characters.");
    } else {
      sanitized.title = data.title.trim();
    }
  }

  if (data.category !== undefined) {
    if (typeof data.category !== 'string' || data.category.trim().length < 2) {
      errors.push("Course 'category' must be at least 2 characters long.");
    } else {
      sanitized.category = data.category.trim();
    }
  }

  if (data.level !== undefined) {
    if (!COURSE_LEVELS.includes(data.level)) {
      errors.push(`Course 'level' must be one of: ${COURSE_LEVELS.join(', ')}.`);
    } else {
      sanitized.level = data.level;
    }
  }

  if (data.duration !== undefined) {
    if (typeof data.duration !== 'string' || data.duration.trim().length === 0) {
      errors.push("Course 'duration' must be a non-empty string.");
    } else {
      sanitized.duration = data.duration.trim();
    }
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push("Course 'price' must be a non-negative number.");
    } else {
      sanitized.price = data.price;
    }
  }

  if (data.originalPrice !== undefined) {
    if (typeof data.originalPrice !== 'number' || data.originalPrice < 0) {
      errors.push("Course 'originalPrice' must be a non-negative number.");
    } else {
      sanitized.originalPrice = data.originalPrice;
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length < 10) {
      errors.push("Course 'description' must be at least 10 characters long.");
    } else {
      sanitized.description = data.description.trim();
    }
  }

  if (data.thumbnail !== undefined) {
    if (typeof data.thumbnail !== 'string' || data.thumbnail.trim().length === 0) {
      errors.push("Course 'thumbnail' must be a non-empty string.");
    } else {
      sanitized.thumbnail = data.thumbnail.trim();
    }
  }

  if (data.instructor !== undefined) {
    if (typeof data.instructor !== 'object' || !data.instructor.name) {
      errors.push("Course 'instructor' must be an object with at least a 'name' property.");
    } else {
      sanitized.instructor = {
        name: String(data.instructor.name).trim(),
        title: data.instructor.title ? String(data.instructor.title).trim() : 'Instructor',
        avatar: data.instructor.avatar ? String(data.instructor.avatar).trim() : '',
      };
    }
  }

  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.push("Course 'skills' must be an array of strings.");
    } else {
      sanitized.skills = data.skills.filter((s: any) => typeof s === 'string').map((s: string) => s.trim());
    }
  }

  if (data.discountPercent !== undefined) {
    if (typeof data.discountPercent !== 'number' || data.discountPercent < 0 || data.discountPercent > 100) {
      errors.push("Course 'discountPercent' must be between 0 and 100.");
    } else {
      sanitized.discountPercent = data.discountPercent;
    }
  }

  if (data.durationWeeks !== undefined) sanitized.durationWeeks = Math.max(0, Number(data.durationWeeks) || 0);
  if (data.hoursLive !== undefined) sanitized.hoursLive = Math.max(0, Number(data.hoursLive) || 0);
  if (data.lessonCount !== undefined) sanitized.lessonCount = Math.max(0, Number(data.lessonCount) || 0);
  if (data.rating !== undefined) sanitized.rating = Math.min(5, Math.max(0, Number(data.rating) || 0));
  if (data.reviewsCount !== undefined) sanitized.reviewsCount = Math.max(0, Number(data.reviewsCount) || 0);
  if (data.featured !== undefined) sanitized.featured = Boolean(data.featured);
  if (data.isUpcoming !== undefined) sanitized.isUpcoming = Boolean(data.isUpcoming);
  if (data.capstoneTitle !== undefined) sanitized.capstoneTitle = String(data.capstoneTitle).trim();
  if (data.capstoneDesc !== undefined) sanitized.capstoneDesc = String(data.capstoneDesc).trim();
  if (data.videoUrl !== undefined) sanitized.videoUrl = String(data.videoUrl).trim();
  if (data.previewVideoUrl !== undefined) sanitized.previewVideoUrl = String(data.previewVideoUrl).trim();

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- MODULE VALIDATORS ----------------

export function validateModuleCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { courseId, moduleNumber, title, order } = data;

  if (!courseId || !isValidObjectId(courseId)) {
    errors.push("Field 'courseId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!moduleNumber || typeof moduleNumber !== 'string' || moduleNumber.trim().length === 0) {
    errors.push("Field 'moduleNumber' is required (e.g. 'Module 01').");
  }

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push("Field 'title' is required and must be at least 2 characters long.");
  }

  const sanitized = {
    courseId,
    moduleNumber: moduleNumber?.trim(),
    title: title?.trim(),
    order: typeof order === 'number' ? order : 0,
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateModuleUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.courseId !== undefined) {
    if (!isValidObjectId(data.courseId)) {
      errors.push("Field 'courseId' must be a valid 24-character hex ObjectId.");
    } else {
      sanitized.courseId = data.courseId;
    }
  }

  if (data.moduleNumber !== undefined) {
    if (typeof data.moduleNumber !== 'string' || data.moduleNumber.trim().length === 0) {
      errors.push("Field 'moduleNumber' must be a non-empty string.");
    } else {
      sanitized.moduleNumber = data.moduleNumber.trim();
    }
  }

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 2) {
      errors.push("Field 'title' must be at least 2 characters long.");
    } else {
      sanitized.title = data.title.trim();
    }
  }

  if (data.order !== undefined) {
    if (typeof data.order !== 'number') {
      errors.push("Field 'order' must be a number.");
    } else {
      sanitized.order = data.order;
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- LESSON VALIDATORS ----------------

export function validateLessonCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { courseId, moduleId, lessonNumber, title, duration, videoUrl, overview, takeaways, order } = data;

  if (!courseId || !isValidObjectId(courseId)) {
    errors.push("Field 'courseId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!moduleId || !isValidObjectId(moduleId)) {
    errors.push("Field 'moduleId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!lessonNumber || typeof lessonNumber !== 'string' || lessonNumber.trim().length === 0) {
    errors.push("Field 'lessonNumber' is required (e.g. '01' or 'Lesson 01').");
  }

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push("Field 'title' is required and must be at least 2 characters long.");
  }

  if (!duration || typeof duration !== 'string' || duration.trim().length === 0) {
    errors.push("Field 'duration' is required (e.g. '18 mins').");
  }

  const sanitized: Record<string, any> = {
    courseId,
    moduleId,
    lessonNumber: lessonNumber?.trim(),
    title: title?.trim(),
    duration: duration?.trim(),
    videoUrl: typeof videoUrl === 'string' ? videoUrl.trim() : '',
    overview: Array.isArray(overview) ? overview.filter((o) => typeof o === 'string').map((o) => o.trim()) : [],
    takeaways: Array.isArray(takeaways)
      ? takeaways
          .filter((t) => t && typeof t === 'object' && t.title && t.desc)
          .map((t) => ({ title: String(t.title).trim(), desc: String(t.desc).trim() }))
      : [],
    order: typeof order === 'number' ? order : 0,
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateLessonUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.courseId !== undefined) {
    if (!isValidObjectId(data.courseId)) {
      errors.push("Field 'courseId' must be a valid 24-character hex ObjectId.");
    } else {
      sanitized.courseId = data.courseId;
    }
  }

  if (data.moduleId !== undefined) {
    if (!isValidObjectId(data.moduleId)) {
      errors.push("Field 'moduleId' must be a valid 24-character hex ObjectId.");
    } else {
      sanitized.moduleId = data.moduleId;
    }
  }

  if (data.lessonNumber !== undefined) {
    if (typeof data.lessonNumber !== 'string' || data.lessonNumber.trim().length === 0) {
      errors.push("Field 'lessonNumber' must be a non-empty string.");
    } else {
      sanitized.lessonNumber = data.lessonNumber.trim();
    }
  }

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 2) {
      errors.push("Field 'title' must be at least 2 characters long.");
    } else {
      sanitized.title = data.title.trim();
    }
  }

  if (data.duration !== undefined) {
    if (typeof data.duration !== 'string' || data.duration.trim().length === 0) {
      errors.push("Field 'duration' must be a non-empty string.");
    } else {
      sanitized.duration = data.duration.trim();
    }
  }

  if (data.videoUrl !== undefined) {
    sanitized.videoUrl = typeof data.videoUrl === 'string' ? data.videoUrl.trim() : '';
  }

  if (data.overview !== undefined) {
    if (!Array.isArray(data.overview)) {
      errors.push("Field 'overview' must be an array of strings.");
    } else {
      sanitized.overview = data.overview.filter((o: any) => typeof o === 'string').map((o: string) => o.trim());
    }
  }

  if (data.takeaways !== undefined) {
    if (!Array.isArray(data.takeaways)) {
      errors.push("Field 'takeaways' must be an array of objects containing 'title' and 'desc'.");
    } else {
      sanitized.takeaways = data.takeaways
        .filter((t: any) => t && typeof t === 'object' && t.title && t.desc)
        .map((t: any) => ({ title: String(t.title).trim(), desc: String(t.desc).trim() }));
    }
  }

  if (data.order !== undefined) {
    if (typeof data.order !== 'number') {
      errors.push("Field 'order' must be a number.");
    } else {
      sanitized.order = data.order;
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- TEST VALIDATORS ----------------

export function validateTestCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { courseId, title, timeLimitMinutes, passingScore, questions } = data;

  if (!courseId || !isValidObjectId(courseId)) {
    errors.push("Field 'courseId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push("Field 'title' is required and must be at least 3 characters long.");
  }

  if (timeLimitMinutes !== undefined && (typeof timeLimitMinutes !== 'number' || timeLimitMinutes < 1 || timeLimitMinutes > 180)) {
    errors.push("Field 'timeLimitMinutes' must be between 1 and 180 minutes.");
  }

  if (passingScore !== undefined && (typeof passingScore !== 'number' || passingScore < 0 || passingScore > 100)) {
    errors.push("Field 'passingScore' must be between 0 and 100.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push("Field 'questions' is required and must contain at least 1 question.");
  } else {
    questions.forEach((q, idx) => {
      if (!q || typeof q !== 'object') {
        errors.push(`Question #${idx + 1} must be an object.`);
        return;
      }
      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        errors.push(`Question #${idx + 1} is missing a question text.`);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question #${idx + 1} must have at least 2 options.`);
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || (Array.isArray(q.options) && q.correctIndex >= q.options.length)) {
        errors.push(`Question #${idx + 1} 'correctIndex' is invalid for the provided options.`);
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`Question #${idx + 1} requires an explanation string.`);
      }
    });
  }

  const sanitized = {
    courseId,
    title: title?.trim(),
    timeLimitMinutes: typeof timeLimitMinutes === 'number' ? timeLimitMinutes : 20,
    passingScore: typeof passingScore === 'number' ? passingScore : 70,
    questions: Array.isArray(questions)
      ? questions.map((q) => ({
          question: String(q.question).trim(),
          codeSnippet: typeof q.codeSnippet === 'string' ? q.codeSnippet : '',
          options: (q.options || []).map((opt: any) => String(opt).trim()),
          correctIndex: Number(q.correctIndex),
          explanation: String(q.explanation).trim(),
        }))
      : [],
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateTestUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push("Field 'title' must be at least 3 characters long.");
    } else {
      sanitized.title = data.title.trim();
    }
  }

  if (data.timeLimitMinutes !== undefined) {
    if (typeof data.timeLimitMinutes !== 'number' || data.timeLimitMinutes < 1 || data.timeLimitMinutes > 180) {
      errors.push("Field 'timeLimitMinutes' must be between 1 and 180 minutes.");
    } else {
      sanitized.timeLimitMinutes = data.timeLimitMinutes;
    }
  }

  if (data.passingScore !== undefined) {
    if (typeof data.passingScore !== 'number' || data.passingScore < 0 || data.passingScore > 100) {
      errors.push("Field 'passingScore' must be between 0 and 100.");
    } else {
      sanitized.passingScore = data.passingScore;
    }
  }

  if (data.questions !== undefined) {
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      errors.push("Field 'questions' must contain at least 1 question.");
    } else {
      data.questions.forEach((q: any, idx: number) => {
        if (!q || typeof q !== 'object') {
          errors.push(`Question #${idx + 1} must be an object.`);
          return;
        }
        if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
          errors.push(`Question #${idx + 1} is missing a question text.`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question #${idx + 1} must have at least 2 options.`);
        }
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || (Array.isArray(q.options) && q.correctIndex >= q.options.length)) {
          errors.push(`Question #${idx + 1} 'correctIndex' is invalid for the provided options.`);
        }
        if (!q.explanation || typeof q.explanation !== 'string') {
          errors.push(`Question #${idx + 1} requires an explanation string.`);
        }
      });

      sanitized.questions = data.questions.map((q: any) => ({
        question: String(q.question).trim(),
        codeSnippet: typeof q.codeSnippet === 'string' ? q.codeSnippet : '',
        options: (q.options || []).map((opt: any) => String(opt).trim()),
        correctIndex: Number(q.correctIndex),
        explanation: String(q.explanation).trim(),
      }));
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- USER VALIDATORS (ADMIN CRUD) ----------------

export function validateAdminUserCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { name, email, password, role, college, district, state, rollNumber, avatar } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.push("Field 'name' is required and must be between 2 and 100 characters.");
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push("Field 'email' is required and must be a valid email address.");
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push("Field 'password' is required and must be at least 6 characters long.");
  }

  if (role !== undefined && role !== ROLES.STUDENT && role !== ROLES.ADMIN) {
    errors.push("Field 'role' must be either 'student' or 'admin'.");
  }

  const sanitized = {
    name: name?.trim(),
    email: email?.trim().toLowerCase(),
    password,
    role: role || ROLES.STUDENT,
    college: typeof college === 'string' ? college.trim() : '',
    district: typeof district === 'string' ? district.trim() : '',
    state: typeof state === 'string' ? state.trim() : '',
    rollNumber: typeof rollNumber === 'string' ? rollNumber.trim() : '',
    avatar: typeof avatar === 'string' ? avatar.trim() : '',
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateAdminUserUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100) {
      errors.push("Field 'name' must be between 2 and 100 characters.");
    } else {
      sanitized.name = data.name.trim();
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim().toLowerCase())) {
      errors.push("Field 'email' must be a valid email address.");
    } else {
      sanitized.email = data.email.trim().toLowerCase();
    }
  }

  if (data.password !== undefined) {
    if (typeof data.password !== 'string' || data.password.length < 6) {
      errors.push("Field 'password' must be at least 6 characters long.");
    } else {
      sanitized.password = data.password;
    }
  }

  if (data.role !== undefined) {
    if (data.role !== ROLES.STUDENT && data.role !== ROLES.ADMIN) {
      errors.push("Field 'role' must be either 'student' or 'admin'.");
    } else {
      sanitized.role = data.role;
    }
  }

  if (data.college !== undefined) sanitized.college = String(data.college).trim();
  if (data.district !== undefined) sanitized.district = String(data.district).trim();
  if (data.state !== undefined) sanitized.state = String(data.state).trim();
  if (data.rollNumber !== undefined) sanitized.rollNumber = String(data.rollNumber).trim();
  if (data.avatar !== undefined) sanitized.avatar = String(data.avatar).trim();

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- ENROLLMENT VALIDATORS ----------------

export function validateEnrollmentCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { courseId, userId, userEmail, isCompleted, completedLessonIds } = data;

  if (!courseId || !isValidObjectId(courseId)) {
    errors.push("Field 'courseId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!userId && !userEmail) {
    errors.push("Either 'userId' (valid ObjectId) or 'userEmail' must be provided.");
  }

  if (userId && !isValidObjectId(userId)) {
    errors.push("Field 'userId' must be a valid 24-character hex ObjectId.");
  }

  if (userEmail && (typeof userEmail !== 'string' || !EMAIL_REGEX.test(userEmail.trim().toLowerCase()))) {
    errors.push("Field 'userEmail' must be a valid email address.");
  }

  const sanitized: Record<string, any> = {
    courseId,
    userId: userId || undefined,
    userEmail: userEmail ? userEmail.trim().toLowerCase() : undefined,
    isCompleted: Boolean(isCompleted),
    completedLessonIds: Array.isArray(completedLessonIds)
      ? completedLessonIds.filter((id: any) => isValidObjectId(id))
      : [],
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateEnrollmentUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.isCompleted !== undefined) {
    sanitized.isCompleted = Boolean(data.isCompleted);
  }

  if (data.completedLessonIds !== undefined) {
    if (!Array.isArray(data.completedLessonIds)) {
      errors.push("Field 'completedLessonIds' must be an array of ObjectIds.");
    } else {
      const invalid = data.completedLessonIds.some((id: any) => !isValidObjectId(id));
      if (invalid) {
        errors.push("All items in 'completedLessonIds' must be valid 24-character hex ObjectIds.");
      } else {
        sanitized.completedLessonIds = data.completedLessonIds;
      }
    }
  }

  if (data.currentLessonId !== undefined) {
    if (!isValidObjectId(data.currentLessonId)) {
      errors.push("Field 'currentLessonId' must be a valid 24-character hex ObjectId.");
    } else {
      sanitized.currentLessonId = data.currentLessonId;
    }
  }

  if (data.testScore !== undefined) {
    if (typeof data.testScore !== 'number' || data.testScore < 0 || data.testScore > 100) {
      errors.push("Field 'testScore' must be a number between 0 and 100.");
    } else {
      sanitized.testScore = data.testScore;
    }
  }

  if (data.testPassed !== undefined) {
    sanitized.testPassed = Boolean(data.testPassed);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- CERTIFICATE VALIDATORS ----------------

export function validateCertificateCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { userId, courseId, studentName, courseTitle, category, score, grade, instructorName, directorName } = data;

  if (!userId || !isValidObjectId(userId)) {
    errors.push("Field 'userId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (!courseId || !isValidObjectId(courseId)) {
    errors.push("Field 'courseId' is required and must be a valid 24-character hex ObjectId.");
  }

  if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
    errors.push("Field 'score' is required and must be a number between 0 and 100.");
  }

  const sanitized = {
    userId,
    courseId,
    studentName: typeof studentName === 'string' ? studentName.trim() : '',
    courseTitle: typeof courseTitle === 'string' ? courseTitle.trim() : '',
    category: typeof category === 'string' ? category.trim() : '',
    score: Number(score),
    grade: typeof grade === 'string' && grade.trim() ? grade.trim() : undefined,
    instructorName: typeof instructorName === 'string' ? instructorName.trim() : undefined,
    directorName: typeof directorName === 'string' ? directorName.trim() : 'Karthik Raja',
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateCertificateUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.studentName !== undefined) {
    if (typeof data.studentName !== 'string' || data.studentName.trim().length === 0) {
      errors.push("Field 'studentName' must be a non-empty string.");
    } else {
      sanitized.studentName = data.studentName.trim();
    }
  }

  if (data.score !== undefined) {
    if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
      errors.push("Field 'score' must be between 0 and 100.");
    } else {
      sanitized.score = data.score;
    }
  }

  if (data.grade !== undefined) {
    if (typeof data.grade !== 'string' || data.grade.trim().length === 0) {
      errors.push("Field 'grade' must be a non-empty string.");
    } else {
      sanitized.grade = data.grade.trim();
    }
  }

  if (data.courseTitle !== undefined) sanitized.courseTitle = String(data.courseTitle).trim();
  if (data.category !== undefined) sanitized.category = String(data.category).trim();
  if (data.instructorName !== undefined) sanitized.instructorName = String(data.instructorName).trim();
  if (data.directorName !== undefined) sanitized.directorName = String(data.directorName).trim();

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- CATEGORY VALIDATORS ----------------

export function validateCategoryCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object.'] };
  }

  const { name, slug, description, icon, order } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.push("Category 'name' is required and must be between 2 and 100 characters.");
  }

  if (slug !== undefined && (typeof slug !== 'string' || slug.trim().length < 2)) {
    errors.push("Category 'slug' must be at least 2 characters long if provided.");
  }

  const sanitized = {
    name: name?.trim(),
    slug: slug ? slug.trim().toLowerCase() : undefined,
    description: typeof description === 'string' ? description.trim() : '',
    icon: typeof icon === 'string' ? icon.trim() : '',
    order: typeof order === 'number' ? order : 0,
  };

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

export function validateCategoryUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { valid: false, errors: ['At least one field is required for update.'] };
  }

  const sanitized: Record<string, any> = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100) {
      errors.push("Category 'name' must be between 2 and 100 characters.");
    } else {
      sanitized.name = data.name.trim();
    }
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string' || data.slug.trim().length < 2) {
      errors.push("Category 'slug' must be at least 2 characters long.");
    } else {
      sanitized.slug = data.slug.trim().toLowerCase();
    }
  }

  if (data.description !== undefined) sanitized.description = String(data.description).trim();
  if (data.icon !== undefined) sanitized.icon = String(data.icon).trim();
  if (data.order !== undefined) sanitized.order = Number(data.order) || 0;
  if (data.isActive !== undefined) sanitized.isActive = Boolean(data.isActive);

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ---------------- COURSE + CURRICULUM BATCH VALIDATOR ----------------

export function validateCourseWithCurriculumCreate(data: any): ValidatorResult {
  const baseResult = validateCourseCreate(data);
  if (!baseResult.valid) {
    return baseResult;
  }

  const errors: string[] = [];
  const sanitizedModules: any[] = [];

  if (data.modules !== undefined) {
    if (!Array.isArray(data.modules)) {
      errors.push("Field 'modules' must be an array of module items.");
    } else {
      data.modules.forEach((m: any, mIdx: number) => {
        if (!m || typeof m !== 'object') {
          errors.push(`Module #${mIdx + 1} must be an object.`);
          return;
        }
        if (!m.title || typeof m.title !== 'string' || m.title.trim().length < 2) {
          errors.push(`Module #${mIdx + 1} is missing a valid title.`);
        }

        const sanitizedLessons: any[] = [];
        if (m.lessons !== undefined) {
          if (!Array.isArray(m.lessons)) {
            errors.push(`Module #${mIdx + 1} 'lessons' must be an array.`);
          } else {
            m.lessons.forEach((l: any, lIdx: number) => {
              if (!l || typeof l !== 'object') {
                errors.push(`Module #${mIdx + 1} Lesson #${lIdx + 1} must be an object.`);
                return;
              }
              if (!l.title || typeof l.title !== 'string' || l.title.trim().length < 2) {
                errors.push(`Module #${mIdx + 1} Lesson #${lIdx + 1} is missing a valid title.`);
              }
              if (!l.duration || typeof l.duration !== 'string' || l.duration.trim().length === 0) {
                errors.push(`Module #${mIdx + 1} Lesson #${lIdx + 1} is missing duration.`);
              }

              sanitizedLessons.push({
                lessonNumber: l.lessonNumber ? String(l.lessonNumber).trim() : `${mIdx + 1}.${lIdx + 1}`,
                title: String(l.title).trim(),
                duration: String(l.duration).trim(),
                videoUrl: l.videoUrl ? String(l.videoUrl).trim() : '',
                overview: Array.isArray(l.overview) ? l.overview.filter((o: any) => typeof o === 'string').map((o: string) => o.trim()) : [],
                takeaways: Array.isArray(l.takeaways)
                  ? l.takeaways.filter((t: any) => t && t.title && t.desc).map((t: any) => ({ title: String(t.title).trim(), desc: String(t.desc).trim() }))
                  : [],
                order: typeof l.order === 'number' ? l.order : lIdx,
              });
            });
          }
        }

        sanitizedModules.push({
          moduleNumber: m.moduleNumber ? String(m.moduleNumber).trim() : `Module 0${mIdx + 1}`,
          title: String(m.title).trim(),
          order: typeof m.order === 'number' ? m.order : mIdx,
          lessons: sanitizedLessons,
        });
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const totalLessons = sanitizedModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const sanitized = {
    ...baseResult.sanitized,
    lessonCount: totalLessons > 0 ? totalLessons : baseResult.sanitized?.lessonCount || 0,
    modules: sanitizedModules,
  };

  return {
    valid: true,
    sanitized,
  };
}

