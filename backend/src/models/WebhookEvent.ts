import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWebhookEvent extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    processed: {
      type: Boolean,
      default: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const WebhookEvent: Model<IWebhookEvent> = mongoose.model<IWebhookEvent>(
  'WebhookEvent',
  webhookEventSchema
);
