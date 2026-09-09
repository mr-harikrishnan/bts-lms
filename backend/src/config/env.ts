import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Missing required environment variable: ${envVar}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// In production, validate Razorpay credentials are provided
if (process.env.NODE_ENV === 'production') {
  const productionRequired = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
  ] as const;

  for (const envVar of productionRequired) {
    const val = process.env[envVar];
    if (!val || val.includes('placeholder')) {
      console.error(`[FATAL] Production requires valid ${envVar}. Found missing or placeholder value.`);
      process.exit(1);
    }
  }
}

export interface Environment {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  EMAILJS_SERVICE_ID?: string;
  EMAILJS_TEMPLATE_ID_PASSWORD_RESET?: string;
  EMAILJS_TEMPLATE_ID_ORDER?: string;
  EMAILJS_TEMPLATE_ID_ENROLLMENT?: string;
  EMAILJS_TEMPLATE_ID_CERTIFICATE?: string;
  EMAILJS_PUBLIC_KEY?: string;
  EMAILJS_PRIVATE_KEY?: string;
  isProduction: boolean;
}

export const env: Environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bts_lms',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_access_secret_key_bts_lms_production_ready_99218',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_bts_lms_production_ready_99218',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_placeholder_secret',
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID_PASSWORD_RESET: process.env.EMAILJS_TEMPLATE_ID_PASSWORD_RESET,
  EMAILJS_TEMPLATE_ID_ORDER: process.env.EMAILJS_TEMPLATE_ID_ORDER,
  EMAILJS_TEMPLATE_ID_ENROLLMENT: process.env.EMAILJS_TEMPLATE_ID_ENROLLMENT,
  EMAILJS_TEMPLATE_ID_CERTIFICATE: process.env.EMAILJS_TEMPLATE_ID_CERTIFICATE,
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
  isProduction: process.env.NODE_ENV === 'production',
};

