import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITestQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  codeSnippet?: string;
  options: string[];
  type?: 'mcq' | 'msq';
  correctIndex?: number;
  correctIndices?: number[];
  explanation: string;
}

export interface ITest extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId | null;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  isOptional: boolean;
  questions: ITestQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const testQuestionSchema = new Schema<ITestQuestion>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  question: {
    type: String,
    required: true,
  },
  codeSnippet: {
    type: String,
    default: '',
  },
  options: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length >= 2, 'Must have at least 2 options'],
  },
  type: {
    type: String,
    enum: ['mcq', 'msq'],
    default: 'mcq',
  },
  correctIndex: {
    type: Number,
    default: 0,
  },
  correctIndices: {
    type: [Number],
    default: [],
  },
  explanation: {
    type: String,
    required: true,
  },
});

const testSchema = new Schema<ITest>(
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
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimitMinutes: {
      type: Number,
      default: 20,
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    questions: [testQuestionSchema],
  },
  {
    timestamps: true,
  }
);

testSchema.index({ courseId: 1, moduleId: 1 }, { unique: true });

testSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Test: Model<ITest> = mongoose.model<ITest>('Test', testSchema);
