import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedLessonIds: mongoose.Types.ObjectId[];
  currentLessonId?: mongoose.Types.ObjectId;
  isCompleted: boolean;
  testScore?: number;
  testPassed?: boolean;
  certificateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedLessonIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    currentLessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    testScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    testPassed: {
      type: Boolean,
    },
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

enrollmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>(
  'Enrollment',
  enrollmentSchema
);
