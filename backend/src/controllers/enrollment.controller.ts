import { Request, Response, NextFunction } from 'express';
import * as enrollmentService from '../services/enrollment.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getUserCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollments = await enrollmentService.getUserEnrollments(req.user!._id.toString());
    apiSuccess(res, enrollments);
  } catch (error) {
    next(error);
  }
}

export async function getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await enrollmentService.getUserCourseProgress(
      req.user!._id.toString(),
      req.params.courseId as string
    );
    if (!result) {
      res.status(404).json({
        success: false,
        message: `User is not enrolled in course '${req.params.courseId}'.`,
      });
      return;
    }
    apiSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentLessonId } = req.body;
    const updated = await enrollmentService.updateCurrentLesson(
      req.user!._id.toString(),
      req.params.courseId as string,
      currentLessonId
    );
    apiSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function markLessonComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await enrollmentService.markLessonComplete(
      req.user!._id.toString(),
      req.params.courseId as string,
      req.params.lessonId as string
    );
    apiSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await enrollmentService.enrollUser(
      req.user!._id.toString(),
      req.params.courseId as string
    );
    apiSuccess(res, enrollment, 201, 'Successfully enrolled in course.');
  } catch (error) {
    next(error);
  }
}
