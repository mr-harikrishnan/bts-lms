import { ValidatorResult } from '../middleware/validation.middleware.js';

export function validateTicketCreate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    errors.push('Ticket subject is required');
  }

  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Ticket description is required');
  }

  const validPriorities = ['low', 'medium', 'high'];
  const priority = data.priority ? String(data.priority).toLowerCase().trim() : 'medium';
  if (!validPriorities.includes(priority)) {
    errors.push("Priority must be one of: 'low', 'medium', 'high'");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      subject: String(data.subject).trim(),
      description: String(data.description).trim(),
      priority,
    },
  };
}

export function validateTicketReply(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.message || typeof data.message !== 'string' || !data.message.trim()) {
    errors.push('Reply message cannot be empty');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      message: String(data.message).trim(),
    },
  };
}

export function validateTicketStatusUpdate(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  const status = data.status ? String(data.status).toLowerCase().trim() : '';

  if (!validStatuses.includes(status)) {
    errors.push("Status must be one of: 'open', 'in_progress', 'resolved', 'closed'");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: { status },
  };
}
