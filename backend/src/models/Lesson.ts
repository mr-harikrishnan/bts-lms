import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILessonTakeaway {
  title: string;
  desc: string;
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  lessonNumber: string;
  title: string;
  duration: string;
  videoUrl?: string;
  overview: string[];
  takeaways: ILessonTakeaway[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
      index: true,
    },
    lessonNumber: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    overview: {
      type: [String],
      default: [],
    },
    takeaways: [
      {
        title: { type: String, required: true },
        desc: { type: String, required: true },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', lessonSchema);
