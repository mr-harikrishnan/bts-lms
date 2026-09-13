import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/roles.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { toObjectId } from '../utils/objectId.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants/orderStatus.js';

// --- Course Management ---

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await Course.create(req.body);
    apiSuccess(res, course, 201, 'Course created successfully.');
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
    apiSuccess(res, course, 200, 'Course updated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.params.courseId as string;
    const course = await Course.findByIdAndDelete(toObjectId(courseId));
    if (!course) {
      apiError(res, 'Course not found.', 404);
      return;
    }
    apiSuccess(res, { message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// --- Enrollment Management ---

export async function getAllEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find()
        .populate('userId', 'name email role')
        .populate('courseId', 'title price')
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

// --- Payment & Refund Management ---

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

// --- Platform Statistics & Metrics ---

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

// --- User Management ---

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

    // Cascade delete associated enrollments
    await Enrollment.deleteMany({ userId: targetUser._id });

    apiSuccess(res, { message: 'User account and associated enrollments removed successfully.' });
  } catch (error) {
    next(error);
  }
}

// --- Manual Enrollment Granting ---

export async function grantManualEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userEmail, courseId } = req.body;

    if (!courseId || (!userId && !userEmail)) {
      apiError(res, 'Course ID and User identifier (userId or userEmail) are required.', 400);
      return;
    }

    let targetUser;
    if (userId) {
      targetUser = await User.findById(toObjectId(userId));
    } else {
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

    // Check existing enrollment
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
      completedLessons: [],
      progress: 0,
      isCompleted: false,
    });

    apiSuccess(res, enrollment, 201, `Enrollment successfully granted for ${targetUser.name}.`);
  } catch (error) {
    next(error);
  }
}

