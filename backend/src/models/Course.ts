import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInstructor {
  name: string;
  title: string;
  avatar: string;
}

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: 'Digital Marketing' | 'Content Creation' | 'Web Development';
  level: 'Beginner-Friendly' | 'Intermediate' | 'Advanced';
  duration: string;
  durationWeeks: number;
  hoursLive: number;
  lessonCount: number;
  rating: number;
  reviewsCount: number;
  description: string;
  thumbnail: string;
  instructor: IInstructor;
  originalPrice: number;
  price: number;
  discountPercent: number;
  capstoneTitle: string;
  capstoneDesc: string;
  skills: string[];
  featured: boolean;
  isUpcoming: boolean;
  previewVideoUrl: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Digital Marketing', 'Content Creation', 'Web Development'],
      index: true,
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['Beginner-Friendly', 'Intermediate', 'Advanced'],
      index: true,
    },
    duration: {
      type: String,
      required: true,
    },
    durationWeeks: {
      type: Number,
      default: 0,
    },
    hoursLive: {
      type: Number,
      default: 0,
    },
    lessonCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    instructor: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    capstoneTitle: {
      type: String,
      default: '',
    },
    capstoneDesc: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
    previewVideoUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
