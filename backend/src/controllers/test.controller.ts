import { Request, Response, NextFunction } from 'express';
import * as testService from '../services/test.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const test = await testService.getCourseTest(req.params.courseId as string, true);
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
      answers
    );
    apiSuccess(res, result, 200, 'Assessment evaluated successfully.');
  } catch (error) {
    next(error);
  }
}
