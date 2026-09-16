import mongoose, { Document, Model, Schema } from 'mongoose';

export type CouponDiscountType = 'fixed' | 'amount' | 'percentage';

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  courseId: mongoose.Types.ObjectId;
  discountType: CouponDiscountType;
  discountValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Associated courseId is required'],
      index: true,
    },
    discountType: {
      type: String,
      enum: ['fixed', 'amount', 'percentage'],
      default: 'fixed',
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxUses: {
      type: Number,
      default: 1000,
      min: [1, 'Max uses must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, courseId: 1 });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', couponSchema);
