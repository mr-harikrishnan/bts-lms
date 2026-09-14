import { ValidatorResult } from '../middleware/validation.middleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(data: any): ValidatorResult {
  const errors: string[] = [];

  // 1. Presence check
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  if (!data.email) {
    errors.push('Email is required');
  }
  if (!data.password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 2. Format check
  const email = String(data.email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      email,
      password: String(data.password),
    },
  };
}

export function validateSignup(data: any): ValidatorResult {
  const errors: string[] = [];

  // 1. Presence check
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Name is required');
  }
  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.push('Email is required');
  }
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 2. Format check
  const rawName = String(data.name).trim();
  if (!/^[A-Za-z\s]+$/.test(rawName)) {
    errors.push('Full Name must contain only letters and spaces (no numbers or special characters)');
  }

  // Capitalize first letter of each word in name
  const formattedName = rawName
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const email = String(data.email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  if (data.college && !/^[A-Za-z\s.,'-]+$/.test(String(data.college).trim())) {
    errors.push('College / Institution must contain letters only (no numbers allowed)');
  }

  if (data.district && !/^[A-Za-z\s.,'-]+$/.test(String(data.district).trim())) {
    errors.push('District must contain letters only (no numbers allowed)');
  }

  const rawDistrict = data.district ? String(data.district).trim() : '';
  const formattedDistrict = rawDistrict
    ? rawDistrict.charAt(0).toUpperCase() + rawDistrict.slice(1)
    : '';

  if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say', ''];
  const gender = data.gender ? String(data.gender).trim() : '';
  if (gender && !validGenders.includes(gender)) {
    errors.push('Invalid gender selected');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Whitelist fields only (prevent role assignment)
  return {
    valid: true,
    sanitized: {
      name: formattedName,
      email,
      password: data.password,
      college: data.college ? String(data.college).trim() : '',
      district: formattedDistrict,
      state: data.state ? String(data.state).trim() : '',
      gender,
      rollNumber: data.rollNumber ? String(data.rollNumber).trim() : '',
      grantName: data.grantName ? String(data.grantName).trim() : '',
      avatar: data.avatar ? String(data.avatar).trim() : '',
    },
  };
}

export function validateForgotPassword(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  if (!data.email) {
    errors.push('Email is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const email = String(data.email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: { email },
  };
}

export function validateResetPassword(data: any): ValidatorResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  if (!data.token) {
    errors.push('Reset token is required');
  }
  if (!data.newPassword) {
    errors.push('New password is required');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const token = String(data.token).trim();
  const newPassword = String(data.newPassword);

  if (token.length < 10) {
    errors.push('Invalid token format');
  }
  if (newPassword.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      token,
      newPassword,
    },
  };
}

