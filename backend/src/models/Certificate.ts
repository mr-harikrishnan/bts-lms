import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICertificate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseTitle: string;
  category: string;
  studentName: string;
  issueDate: Date;
  credentialId: string;
  score: number;
  grade: string;
  verificationKey: string;
  instructorName: string;
  directorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
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
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    credentialId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    verificationKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    instructorName: {
      type: String,
      required: true,
      trim: true,
    },
    directorName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Certificate: Model<ICertificate> = mongoose.model<ICertificate>(
  'Certificate',
  certificateSchema
);
