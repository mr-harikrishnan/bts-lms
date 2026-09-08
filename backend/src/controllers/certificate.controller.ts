import { Request, Response, NextFunction } from 'express';
import * as certificateService from '../services/certificate.service.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getUserCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certs = await certificateService.getUserCertificates(req.user!._id.toString());
    apiSuccess(res, certs);
  } catch (error) {
    next(error);
  }
}

export async function getCertificateById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cert = await certificateService.getCertificateById(
      req.params.certificateId as string,
      req.user!._id.toString(),
      req.user!.role
    );
    apiSuccess(res, cert);
  } catch (error) {
    next(error);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { courseId, score } = req.body;
    const cert = await certificateService.generateCertificate(
      req.user!._id.toString(),
      courseId,
      score || 100
    );
    apiSuccess(res, cert, 201, 'Certificate issued successfully.');
  } catch (error) {
    next(error);
  }
}
