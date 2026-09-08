import crypto from "crypto";

/**
 * Validates whether a given string is a valid 24-character hexadecimal MongoDB ObjectId.
 */
export function isValidObjectId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Generates a valid 24-character hexadecimal MongoDB ObjectId string.
 * Uses 4-byte timestamp (seconds) + 5-byte random value + 3-byte incrementing/random counter.
 */
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  const randomBytes = crypto.randomBytes(8).toString("hex").padStart(16, "0");
  return `${timestamp}${randomBytes}`.toLowerCase();
}
