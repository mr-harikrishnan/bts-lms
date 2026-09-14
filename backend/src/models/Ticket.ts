import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITicketReply {
  _id?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'student' | 'admin';
  message: string;
  createdAt: Date;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  replies: ITicketReply[];
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<ITicketReply>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    replies: [replySchema],
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ createdAt: -1 });

export const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema);
