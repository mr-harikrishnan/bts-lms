import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) {
    throw new Error('Password is required for hashing');
  }
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function comparePassword(plainText: string, hashedPassword?: string): Promise<boolean> {
  if (!plainText || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainText, hashedPassword);
}
