import mongoose, { Document, Model, Schema } from 'mongoose';
import { PAYMENT_STATUS, PaymentStatus } from '../constants/orderStatus.js';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  errorDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: [true, 'Razorpay Payment ID is required'],
      unique: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required'],
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CAPTURED,
      index: true,
    },
    method: {
      type: String,
      default: '',
    },
    bank: {
      type: String,
      default: '',
    },
    wallet: {
      type: String,
      default: '',
    },
    vpa: {
      type: String,
      default: '',
    },
    errorDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
