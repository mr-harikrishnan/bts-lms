import { ValidatorResult } from '../middleware/validation.middleware.js';
import { isValidObjectId } from '../utils/objectId.js';

export function validateTestSubmission(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) {
    errors.push('answers must be an object map of question ObjectIds to selected answer indices');
    return { valid: false, errors };
  }

  const sanitizedAnswers: Record<string, number> = {};
  for (const [qId, ans] of Object.entries(data.answers)) {
    if (!isValidObjectId(qId)) {
      errors.push(`Invalid question ObjectId format: '${qId}'`);
    }
    const ansNum = Number(ans);
    if (!Number.isInteger(ansNum) || ansNum < 0) {
      errors.push(`Invalid selected option index for question '${qId}'`);
    } else {
      sanitizedAnswers[qId] = ansNum;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      answers: sanitizedAnswers,
    },
  };
}
