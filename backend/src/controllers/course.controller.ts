import { Request, Response, NextFunction } from 'express';
import * as courseService from '../services/course.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await courseService.getAllCourses(req.query);
    apiSuccess(res, result.courses);
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requestingUser = req.user
      ? { _id: req.user._id.toString(), role: req.user.role }
      : undefined;

    const course = await courseService.getCourseWithFullCurriculum(
      req.params.courseId as string,
      requestingUser
    );
    apiSuccess(res, course);
  } catch (error) {
    next(error);
  }
}

export async function getCourseModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requestingUser = req.user
      ? { _id: req.user._id.toString(), role: req.user.role }
      : undefined;

    const modules = await courseService.getCourseModules(
      req.params.courseId as string,
      requestingUser
    );
    apiSuccess(res, modules);
  } catch (error) {
    next(error);
  }
}

export async function getCourseLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lessons = await courseService.getCourseLessons(
      req.params.courseId as string,
      req.user!._id.toString(),
      req.user!.role
    );
    apiSuccess(res, lessons);
  } catch (error) {
    next(error);
  }
}

export async function getCourseLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await courseService.getSingleLesson(
      req.params.courseId as string,
      req.params.lessonId as string,
      req.user!._id.toString(),
      req.user!.role
    );
    apiSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
}

export async function getModuleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const mod = await courseService.getModuleById(
      req.params.id as string,
      req.user?._id.toString(),
      req.user?.role
    );
    apiSuccess(res, mod);
  } catch (error) {
    next(error);
  }
}

export async function getLessonById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await courseService.getLessonById(
      req.params.id as string,
      req.user!._id.toString(),
      req.user!.role
    );
    apiSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
}
