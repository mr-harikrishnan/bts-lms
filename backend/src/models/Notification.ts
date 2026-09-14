import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotificationReadBy {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
  title: string;
  message: string;
  type: 'course_new' | 'ticket_reply' | 'system';
  courseId?: mongoose.Types.ObjectId | null;
  ticketId?: string;
  isRead: boolean;
  readAt?: Date | null;
  readBy: INotificationReadBy[];
  deletedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['course_new', 'ticket_reply', 'system'],
      default: 'system',
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
      index: true,
    },
    ticketId: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
