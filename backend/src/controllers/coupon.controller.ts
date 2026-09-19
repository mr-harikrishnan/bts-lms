import { Request, Response, NextFunction } from 'express';
import * as couponService from '../services/coupon.service.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.body.courseId;
    const code = req.body.code || req.body.couponCode;
    if (!courseId || !code) {
      apiError(res, 'Both "courseId" and "code" are required.', 400);
      return;
    }
    const result = await couponService.validateCoupon(code, courseId);
    apiSuccess(res, result, 200, result.message);
  } catch (error) {
    next(error);
  }
}

export async function redeemFreeCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiError(res, 'Authentication required to redeem coupon.', 401);
      return;
    }
    const courseId = req.body.courseId;
    const code = req.body.code || req.body.couponCode;
    if (!courseId || !code) {
      apiError(res, 'Both "courseId" and "code" are required.', 400);
      return;
    }
    const result = await couponService.redeemFreeCoupon(userId, courseId, code);
    apiSuccess(res, result, 201, result.message);
  } catch (error) {
    next(error);
  }
}

export async function getAdminCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = req.query.courseId as string;
    if (!courseId) {
      apiError(res, 'Query parameter "courseId" is required.', 400);
      return;
    }
    const coupons = await couponService.getCouponsByCourse(courseId);
    apiSuccess(res, coupons);
  } catch (error) {
    next(error);
  }
}

export async function createAdminCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user?.id;
    const { courseId, code, discountType, discountValue, maxUses, expiresAt } = req.body;
    if (!courseId) {
      apiError(res, 'Field "courseId" is required.', 400);
      return;
    }
    if (discountValue === undefined || discountValue === null || Number(discountValue) < 0) {
      apiError(res, 'Valid non-negative "discountValue" is required.', 400);
      return;
    }

    const coupon = await couponService.createCoupon(
      {
        courseId,
        code,
        discountType: discountType || 'fixed',
        discountValue: Number(discountValue),
        maxUses: maxUses ? Number(maxUses) : 1000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      adminId
    );

    apiSuccess(res, coupon, 201, `Coupon '${coupon.code}' created successfully.`);
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await couponService.deleteCoupon(id as string);
    if (!deleted) {
      apiError(res, 'Coupon not found or already deleted.', 404);
      return;
    }
    apiSuccess(res, { deleted: true }, 200, 'Coupon deleted successfully.');
  } catch (error) {
    next(error);
  }
}

export async function toggleAdminCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const coupon = await couponService.toggleCouponStatus(id as string);
    if (!coupon) {
      apiError(res, 'Coupon not found.', 404);
      return;
    }
    apiSuccess(res, coupon, 200, `Coupon is now ${coupon.isActive ? 'active' : 'inactive'}.`);
  } catch (error) {
    next(error);
  }
}
