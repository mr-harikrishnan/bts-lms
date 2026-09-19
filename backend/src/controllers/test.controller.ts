import { Request, Response, NextFunction } from 'express';
import * as testService from '../services/test.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;
    const test = await testService.getCourseTest(
      req.params.courseId as string,
      true,
      undefined,
      userId,
      userRole
    );
    if (!test) {
      res.status(404).json({
        success: false,
        message: `Assessment for course '${req.params.courseId}'. was not found.`,
      });
      return;
    }
    apiSuccess(res, test);
  } catch (error) {
    next(error);
  }
}

export async function submitTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { answers } = req.body;
    const result = await testService.gradeCourseTest(
      req.user!._id.toString(),
      req.params.courseId as string,
      answers,
      undefined,
      req.user!.role
    );
    apiSuccess(res, result, 200, 'Assessment evaluated successfully.');
  } catch (error) {
    next(error);
  }
}

export async function getModuleTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, moduleId } = req.params;
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;
    const test = await testService.getCourseTest(
      courseId as string,
      true,
      moduleId as string,
      userId,
      userRole
    );
    if (!test) {
      res.status(404).json({
        success: false,
        message: `Quiz assessment for module '${moduleId}' was not found.`,
      });
      return;
    }
    apiSuccess(res, test);
  } catch (error) {
    next(error);
  }
}

export async function submitModuleTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, moduleId } = req.params;
    const { answers } = req.body;
    const result = await testService.gradeCourseTest(
      req.user!._id.toString(),
      courseId as string,
      answers,
      moduleId as string,
      req.user!.role
    );
    apiSuccess(res, result, 200, 'Module quiz evaluated successfully.');
  } catch (error) {
    next(error);
  }
}
