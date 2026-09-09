import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
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
