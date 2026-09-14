import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Test } from '../models/Test.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Certificate } from '../models/Certificate.js';
import { ROLES } from '../constants/roles.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { toObjectId } from '../utils/objectId.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants/orderStatus.js';
import { hashPassword } from '../utils/password.js';
import { calculateCurriculumDuration } from '../utils/duration.js';
import { createCourseNotification } from '../services/notification.service.js';

// ==========================================
// Helper to synchronize course duration, hoursLive, and lessonCount automatically from child lessons
async function syncCourseDurationMetrics(courseId: any) {
  try {
    const cOid = toObjectId(courseId);
    if (!cOid) return;
    const lessons = await Lesson.find({ courseId: cOid }).select('duration');
    const course = await Course.findById(cOid);
    if (!course) return;

    const { hoursLive, formattedDuration } = calculateCurriculumDuration(lessons, course.durationWeeks);
    course.lessonCount = lessons.length;
    course.hoursLive = hoursLive;
    course.duration = formattedDuration;
    await course.save();
  } catch (err) {
    console.error('Failed to sync course duration metrics:', err);
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await Course.create(req.body);
    // Broadcast notification to all learners
    createCourseNotification(course._id.toString(), course.title).catch(() => {});
    apiSuccess(res, course, 201, 'Course created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function createCourseWithCurriculum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { modules, ...courseData } = req.body;

    // 1. Create Course
    const course = await Course.create(courseData);

    const createdModules: any[] = [];
    let totalLessons = 0;

    // 2. Create Modules & Lessons if provided
    if (Array.isArray(modules) && modules.length > 0) {
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const m = modules[mIdx];
        const newModule = await Module.create({
          courseId: course._id,
          moduleNumber: m.moduleNumber || `Module 0${mIdx + 1}`,
          title: m.title,
          order: m.order ?? mIdx,
        });

        const createdLessons: any[] = [];
        if (Array.isArray(m.lessons) && m.lessons.length > 0) {
          for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
            const l = m.lessons[lIdx];
            const newLesson = await Lesson.create({
              courseId: course._id,
              moduleId: newModule._id,
              lessonNumber: l.lessonNumber || `${mIdx + 1}.${lIdx + 1}`,
              title: l.title,
              duration: l.duration,
              videoUrl: l.videoUrl || '',
              overview: l.overview || [],
              takeaways: l.takeaways || [],
              order: l.order ?? lIdx,
            });
            createdLessons.push(newLesson);
            totalLessons++;
          }
        }

        createdModules.push({
          ...newModule.toJSON(),
          lessons: createdLessons,
        });
      }

      // Automatically sync course duration, hoursLive, and lessonCount from lessons
      await syncCourseDurationMetrics(course._id);
    }

    // Broadcast notification to all learners
    createCourseNotification(course._id.toString(), course.title).catch(() => {});

    apiSuccess(
      res,
      {
        course,
        modules: createdModules,
      },
      201,
      'Course and full curriculum published successfully.'
    );
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.params.courseId as string;
    const course = await Course.findById(toObjectId(courseId));
    if (!course) {
      apiError(res, 'Course not found.', 404);
      return;
    }
    apiSuccess(res, course);
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.params.courseId as string;
    const course = await Course.findByIdAndUpdate(
      toObjectId(courseId),
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) {
      apiError(res, 'Course not found.', 404);
      return;
    }
    await syncCourseDurationMetrics(course._id);
    const updated = await Course.findById(course._id);
    apiSuccess(res, updated || course, 200, 'Course updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.params.courseId as string;
    const courseOid = toObjectId(courseId);
    const course = await Course.findByIdAndDelete(courseOid);
    if (!course) {
      apiError(res, 'Course not found.', 404);
      return;
    }

    // Cascade delete associated modules, lessons, and tests
    await Promise.all([
      Module.deleteMany({ courseId: courseOid }),
      Lesson.deleteMany({ courseId: courseOid }),
      Test.deleteMany({ courseId: courseOid }),
    ]);

    apiSuccess(res, { message: 'Course and related curriculum deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 2. MODULE CRUD OPERATIONS
// ==========================================

export async function createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, moduleNumber, title, order } = req.body;
    const course = await Course.findById(toObjectId(courseId));
    if (!course) {
      apiError(res, 'Associated course not found.', 404);
      return;
    }

    const mod = await Module.create({
      courseId: course._id,
      moduleNumber,
      title,
      order: order ?? 0,
    });

    apiSuccess(res, mod, 201, 'Module created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.courseId) {
      filter.courseId = toObjectId(req.query.courseId as string);
    }

    const modules = await Module.find(filter)
      .populate('courseId', 'title category')
      .sort({ order: 1, createdAt: 1 });

    apiSuccess(res, modules);
  } catch (error) {
    next(error);
  }
}

export async function getModuleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const mod = await Module.findById(toObjectId(moduleId)).populate('courseId', 'title category');
    if (!mod) {
      apiError(res, 'Module not found.', 404);
      return;
    }
    apiSuccess(res, mod);
  } catch (error) {
    next(error);
  }
}

export async function updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const updateData: Record<string, any> = { ...req.body };
    if (updateData.courseId) {
      updateData.courseId = toObjectId(updateData.courseId);
    }

    const mod = await Module.findByIdAndUpdate(
      toObjectId(moduleId),
      updateData,
      { new: true, runValidators: true }
    );
    if (!mod) {
      apiError(res, 'Module not found.', 404);
      return;
    }
    apiSuccess(res, mod, 200, 'Module updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const moduleId = req.params.moduleId as string;
    const moduleOid = toObjectId(moduleId);
    const mod = await Module.findByIdAndDelete(moduleOid);
    if (!mod) {
      apiError(res, 'Module not found.', 404);
      return;
    }

    // Cascade delete lessons under this module
    await Lesson.deleteMany({ moduleId: moduleOid });
    await syncCourseDurationMetrics(mod.courseId);

    apiSuccess(res, { message: 'Module and associated lessons deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 3. LESSON CRUD OPERATIONS
// ==========================================

export async function createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, moduleId, lessonNumber, title, duration, videoUrl, overview, takeaways, order } = req.body;

    const [course, mod] = await Promise.all([
      Course.findById(toObjectId(courseId)),
      Module.findById(toObjectId(moduleId)),
    ]);

    if (!course) {
      apiError(res, 'Associated course not found.', 404);
      return;
    }
    if (!mod) {
      apiError(res, 'Associated module not found.', 404);
      return;
    }

    const lesson = await Lesson.create({
      courseId: course._id,
      moduleId: mod._id,
      lessonNumber,
      title,
      duration,
      videoUrl: videoUrl || '',
      overview: overview || [],
      takeaways: takeaways || [],
      order: order ?? 0,
    });

    // Automatically recalculate course duration, hoursLive, and lessonCount
    await syncCourseDurationMetrics(course._id);

    apiSuccess(res, lesson, 201, 'Lesson created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.moduleId) {
      filter.moduleId = toObjectId(req.query.moduleId as string);
    }
    if (req.query.courseId) {
      filter.courseId = toObjectId(req.query.courseId as string);
    }

    const lessons = await Lesson.find(filter)
      .populate('courseId', 'title')
      .populate('moduleId', 'title moduleNumber')
      .sort({ order: 1, createdAt: 1 });

    apiSuccess(res, lessons);
  } catch (error) {
    next(error);
  }
}

export async function getLessonById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lessonId = req.params.lessonId as string;
    const lesson = await Lesson.findById(toObjectId(lessonId))
      .populate('courseId', 'title')
      .populate('moduleId', 'title moduleNumber');

    if (!lesson) {
      apiError(res, 'Lesson not found.', 404);
      return;
    }
    apiSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
}

export async function updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lessonId = req.params.lessonId as string;
    const updateData: Record<string, any> = { ...req.body };
    if (updateData.courseId) updateData.courseId = toObjectId(updateData.courseId);
    if (updateData.moduleId) updateData.moduleId = toObjectId(updateData.moduleId);

    const lesson = await Lesson.findByIdAndUpdate(
      toObjectId(lessonId),
      updateData,
      { new: true, runValidators: true }
    );
    if (!lesson) {
      apiError(res, 'Lesson not found.', 404);
      return;
    }

    // Automatically recalculate course duration metrics
    await syncCourseDurationMetrics(lesson.courseId);

    apiSuccess(res, lesson, 200, 'Lesson updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lessonId = req.params.lessonId as string;
    const lesson = await Lesson.findByIdAndDelete(toObjectId(lessonId));
    if (!lesson) {
      apiError(res, 'Lesson not found.', 404);
      return;
    }

    // Automatically recalculate course duration metrics
    await syncCourseDurationMetrics(lesson.courseId);

    apiSuccess(res, { message: 'Lesson deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 4. TEST / QUIZ CRUD OPERATIONS
// ==========================================

export async function createTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, title, timeLimitMinutes, passingScore, questions } = req.body;
    const courseOid = toObjectId(courseId);

    const course = await Course.findById(courseOid);
    if (!course) {
      apiError(res, 'Associated course not found.', 404);
      return;
    }

    const existingTest = await Test.findOne({ courseId: courseOid });
    if (existingTest) {
      apiError(res, 'A test already exists for this course. Please update the existing test instead.', 409);
      return;
    }

    const test = await Test.create({
      courseId: courseOid,
      title,
      timeLimitMinutes: timeLimitMinutes ?? 20,
      passingScore: passingScore ?? 70,
      questions,
    });

    apiSuccess(res, test, 201, 'Test created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getAllTests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: Record<string, any> = {};
    if (req.query.courseId) {
      filter.courseId = toObjectId(req.query.courseId as string);
    }

    const tests = await Test.find(filter).populate('courseId', 'title category');
    apiSuccess(res, tests);
  } catch (error) {
    next(error);
  }
}

export async function getTestById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const test = await Test.findById(toObjectId(testId)).populate('courseId', 'title category');
    if (!test) {
      apiError(res, 'Test not found.', 404);
      return;
    }
    apiSuccess(res, test);
  } catch (error) {
    next(error);
  }
}

export async function updateTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const test = await Test.findByIdAndUpdate(
      toObjectId(testId),
      req.body,
      { new: true, runValidators: true }
    );
    if (!test) {
      apiError(res, 'Test not found.', 404);
      return;
    }
    apiSuccess(res, test, 200, 'Test updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const test = await Test.findByIdAndDelete(toObjectId(testId));
    if (!test) {
      apiError(res, 'Test not found.', 404);
      return;
    }
    apiSuccess(res, { message: 'Test deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 5. USER MANAGEMENT CRUD OPERATIONS
// ==========================================

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role, college, district, state, rollNumber, avatar } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      apiError(res, 'An account with this email address already exists.', 409);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || ROLES.STUDENT,
      college: college || '',
      district: district || '',
      state: state || '',
      rollNumber: rollNumber || '',
      avatar: avatar || '',
    });

    apiSuccess(res, user.toJSON(), 201, 'User account created successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = ((req.query.search as string) || '').trim();
    const role = (req.query.role as string) || '';
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role && (role === ROLES.STUDENT || role === ROLES.ADMIN)) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    apiSuccess(res, {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const user = await User.findById(toObjectId(userId))
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      apiError(res, 'User not found.', 404);
      return;
    }

    apiSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const userOid = toObjectId(userId);
    const updateData: Record<string, any> = { ...req.body };

    const targetUser = await User.findById(userOid);
    if (!targetUser) {
      apiError(res, 'User not found.', 404);
      return;
    }

    // Safeguard: Prevent admin from revoking their own admin role
    if (req.user && req.user._id.toString() === userId && updateData.role && updateData.role !== ROLES.ADMIN) {
      apiError(res, 'Security restriction: You cannot revoke your own administrator privileges.', 400);
      return;
    }

    // If changing email, check uniqueness
    if (updateData.email && updateData.email !== targetUser.email) {
      const emailConflict = await User.findOne({ email: updateData.email, _id: { $ne: userOid } });
      if (emailConflict) {
        apiError(res, 'Email address is already in use by another account.', 409);
        return;
      }
    }

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(userOid, updateData, { new: true, runValidators: true })
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    apiSuccess(res, updatedUser, 200, 'User updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { role } = req.body;

    if (!role || (role !== ROLES.STUDENT && role !== ROLES.ADMIN)) {
      apiError(res, 'Valid role (student or admin) is required.', 400);
      return;
    }

    // Safeguard: Prevent admin from demoting themselves
    if (req.user && req.user._id.toString() === userId && role !== ROLES.ADMIN) {
      apiError(res, 'Security restriction: You cannot revoke your own administrator privileges.', 400);
      return;
    }

    const targetUser = await User.findById(toObjectId(userId));
    if (!targetUser) {
      apiError(res, 'User not found.', 404);
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    apiSuccess(res, targetUser.toJSON(), 200, `User role updated to ${role}.`);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;

    // Safeguard: Prevent admin from deleting their own account
    if (req.user && req.user._id.toString() === userId) {
      apiError(res, 'Security restriction: You cannot delete your own administrator account.', 400);
      return;
    }

    const targetUser = await User.findByIdAndDelete(toObjectId(userId));
    if (!targetUser) {
      apiError(res, 'User not found.', 404);
      return;
    }

    // Cascade delete associated enrollments and certificates
    await Promise.all([
      Enrollment.deleteMany({ userId: targetUser._id }),
      Certificate.deleteMany({ userId: targetUser._id }),
    ]);

    apiSuccess(res, { message: 'User account, enrollments, and certificates removed successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 6. ENROLLMENT CRUD OPERATIONS
// ==========================================

export async function grantManualEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userEmail, courseId, isCompleted, completedLessonIds } = req.body;

    let targetUser;
    if (userId) {
      targetUser = await User.findById(toObjectId(userId));
    } else if (userEmail) {
      targetUser = await User.findOne({ email: userEmail.toLowerCase().trim() });
    }

    if (!targetUser) {
      apiError(res, 'Target user account not found.', 404);
      return;
    }

    const targetCourse = await Course.findById(toObjectId(courseId));
    if (!targetCourse) {
      apiError(res, 'Target course not found.', 404);
      return;
    }

    const existing = await Enrollment.findOne({
      userId: targetUser._id,
      courseId: targetCourse._id,
    });

    if (existing) {
      apiError(res, 'User is already enrolled in this course.', 409);
      return;
    }

    const enrollment = await Enrollment.create({
      userId: targetUser._id,
      courseId: targetCourse._id,
      completedLessonIds: completedLessonIds || [],
      isCompleted: Boolean(isCompleted),
    });

    apiSuccess(res, enrollment, 201, `Enrollment successfully granted for ${targetUser.name}.`);
  } catch (error) {
    next(error);
  }
}

export async function getAllEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find()
        .populate('userId', 'name email role')
        .populate('courseId', 'title price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(),
    ]);

    apiSuccess(res, {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEnrollmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollmentId = req.params.enrollmentId as string;
    const enrollment = await Enrollment.findById(toObjectId(enrollmentId))
      .populate('userId', 'name email')
      .populate('courseId', 'title price category thumbnail');

    if (!enrollment) {
      apiError(res, 'Enrollment record not found.', 404);
      return;
    }

    apiSuccess(res, enrollment);
  } catch (error) {
    next(error);
  }
}

export async function updateEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollmentId = req.params.enrollmentId as string;
    const updateData: Record<string, any> = { ...req.body };

    if (updateData.currentLessonId) {
      updateData.currentLessonId = toObjectId(updateData.currentLessonId);
    }
    if (Array.isArray(updateData.completedLessonIds)) {
      updateData.completedLessonIds = updateData.completedLessonIds.map(toObjectId);
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      toObjectId(enrollmentId),
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    if (!enrollment) {
      apiError(res, 'Enrollment record not found.', 404);
      return;
    }

    apiSuccess(res, enrollment, 200, 'Enrollment updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function revokeEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollmentId = req.params.enrollmentId as string;
    const enrollment = await Enrollment.findByIdAndDelete(toObjectId(enrollmentId));
    if (!enrollment) {
      apiError(res, 'Enrollment record not found.', 404);
      return;
    }
    apiSuccess(res, { message: 'Enrollment revoked successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 7. CERTIFICATE CRUD OPERATIONS
// ==========================================

export async function createCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, courseId, score, grade, studentName, courseTitle, category, instructorName, directorName } = req.body;
    const userOid = toObjectId(userId);
    const courseOid = toObjectId(courseId);

    const [user, course] = await Promise.all([
      User.findById(userOid),
      Course.findById(courseOid),
    ]);

    if (!user) {
      apiError(res, 'User not found for certificate generation.', 404);
      return;
    }
    if (!course) {
      apiError(res, 'Course not found for certificate generation.', 404);
      return;
    }

    const existingCert = await Certificate.findOne({ userId: userOid, courseId: courseOid });
    if (existingCert) {
      apiError(res, 'A certificate has already been issued for this user and course.', 409);
      return;
    }

    const categoryAbbr = (category || course.category).slice(0, 3).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const credentialId = `BTS-${categoryAbbr}-${new Date().getFullYear()}-${randomHex}`;
    const verificationKey = `VKEY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    let computedGrade = grade;
    if (!computedGrade) {
      if (score >= 95) computedGrade = 'A+';
      else if (score >= 90) computedGrade = 'A';
      else if (score >= 80) computedGrade = 'B+';
      else computedGrade = 'B';
    }

    const certificate = await Certificate.create({
      userId: userOid,
      courseId: courseOid,
      courseTitle: courseTitle || course.title,
      category: category || course.category,
      studentName: studentName || user.name,
      issueDate: new Date(),
      credentialId,
      score,
      grade: computedGrade,
      verificationKey,
      instructorName: instructorName || course.instructor?.name || 'BTS Academy',
      directorName: directorName || 'Karthik Raja',
    });

    apiSuccess(res, certificate, 201, 'Certificate issued successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getAllCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      Certificate.find()
        .populate('userId', 'name email')
        .populate('courseId', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Certificate.countDocuments(),
    ]);

    apiSuccess(res, {
      certificates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCertificateById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificateId = req.params.certificateId as string;
    const cert = await Certificate.findById(toObjectId(certificateId))
      .populate('userId', 'name email')
      .populate('courseId', 'title category');

    if (!cert) {
      apiError(res, 'Certificate not found.', 404);
      return;
    }

    apiSuccess(res, cert);
  } catch (error) {
    next(error);
  }
}

export async function updateCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificateId = req.params.certificateId as string;
    const cert = await Certificate.findByIdAndUpdate(
      toObjectId(certificateId),
      req.body,
      { new: true, runValidators: true }
    );
    if (!cert) {
      apiError(res, 'Certificate not found.', 404);
      return;
    }
    apiSuccess(res, cert, 200, 'Certificate updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificateId = req.params.certificateId as string;
    const cert = await Certificate.findByIdAndDelete(toObjectId(certificateId));
    if (!cert) {
      apiError(res, 'Certificate not found.', 404);
      return;
    }
    apiSuccess(res, { message: 'Certificate revoked and deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 8. PAYMENT & REFUND MANAGEMENT
// ==========================================

export async function getAllPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find()
        .populate('userId', 'name email')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(),
    ]);

    apiSuccess(res, {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentId = req.params.paymentId as string;
    const payment = await Payment.findById(toObjectId(paymentId));
    if (!payment) {
      apiError(res, 'Payment record not found.', 404);
      return;
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, { status: ORDER_STATUS.REFUNDED });

    // Revoke course access upon refund
    await Enrollment.findOneAndDelete({
      userId: payment.userId,
      courseId: payment.courseId,
    });

    apiSuccess(res, { message: 'Payment marked refunded and enrollment revoked.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 9. PLATFORM STATISTICS & METRICS
// ==========================================

export async function getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalStudents, totalAdmins, totalCourses, totalEnrollments, successfulPayments, recentEnrollments] =
      await Promise.all([
        User.countDocuments({ role: ROLES.STUDENT }),
        User.countDocuments({ role: ROLES.ADMIN }),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Payment.find({ status: PAYMENT_STATUS.CAPTURED }).select('amount'),
        Enrollment.find()
          .populate('userId', 'name email avatar')
          .populate('courseId', 'title category price thumbnail')
          .sort({ createdAt: -1 })
          .limit(8),
      ]);

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    apiSuccess(res, {
      totalStudents,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      recentEnrollments,
    });
  } catch (error) {
    next(error);
  }
}
