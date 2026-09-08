import mongoose from 'mongoose';

export function isValidObjectId(id: unknown): id is string {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId | null {
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  if (!isValidObjectId(id)) {
    return null;
  }
  return new mongoose.Types.ObjectId(id);
}
