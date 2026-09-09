import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface EmailParams {
  templateId?: string;
  templateParams: Record<string, any>;
  recipientEmail: string;
}

async function sendEmailViaEmailJS(params: EmailParams): Promise<boolean> {
  const { templateId, templateParams, recipientEmail } = params;

  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_PUBLIC_KEY || !templateId) {
    logger.info(
      `[EmailService] EmailJS service or template not configured. Simulated dispatch to: ${recipientEmail}`
    );
    return true;
  }

  try {
    const payload: Record<string, any> = {
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: env.EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    };

    if (env.EMAILJS_PRIVATE_KEY) {
      payload.accessToken = env.EMAILJS_PRIVATE_KEY;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[EmailService] EmailJS dispatch failed:', {
        status: response.status,
        error: errorText,
      });
      return false;
    }

    logger.info(`[EmailService] Email sent successfully to: ${recipientEmail}`);
    return true;
  } catch (error) {
    logger.error('[EmailService] Network or unexpected error during email send:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  name: string,
  resetLink: string
): Promise<boolean> {
  if (!toEmail || !resetLink) {
    logger.warn('[EmailService] Cannot send reset email without recipient and reset link.');
    return false;
  }

  return sendEmailViaEmailJS({
    templateId: env.EMAILJS_TEMPLATE_ID_PASSWORD_RESET,
    recipientEmail: toEmail,
    templateParams: {
      to_name: name || 'Student',
      to_email: toEmail,
      reset_link: resetLink,
      support_email: 'support@bstorm.edu',
      validity_minutes: 15,
    },
  });
}

export async function sendOrderConfirmationEmail(
  toEmail: string,
  name: string,
  orderDetails: { courseTitle: string; amount: number; orderId: string }
): Promise<boolean> {
  if (!toEmail) return false;

  return sendEmailViaEmailJS({
    templateId: env.EMAILJS_TEMPLATE_ID_ORDER,
    recipientEmail: toEmail,
    templateParams: {
      to_name: name || 'Student',
      to_email: toEmail,
      course_title: orderDetails.courseTitle,
      amount: `₹${(orderDetails.amount / 100).toFixed(2)}`,
      order_id: orderDetails.orderId,
    },
  });
}

export async function sendEnrollmentConfirmationEmail(
  toEmail: string,
  name: string,
  courseTitle: string
): Promise<boolean> {
  if (!toEmail) return false;

  return sendEmailViaEmailJS({
    templateId: env.EMAILJS_TEMPLATE_ID_ENROLLMENT,
    recipientEmail: toEmail,
    templateParams: {
      to_name: name || 'Student',
      to_email: toEmail,
      course_title: courseTitle,
      dashboard_link: `${env.FRONTEND_URL}/dashboard`,
    },
  });
}

export async function sendCertificateEmail(
  toEmail: string,
  name: string,
  certificateDetails: {
    courseTitle: string;
    certificateId: string;
    verificationUrl: string;
  }
): Promise<boolean> {
  if (!toEmail) return false;

  return sendEmailViaEmailJS({
    templateId: env.EMAILJS_TEMPLATE_ID_CERTIFICATE,
    recipientEmail: toEmail,
    templateParams: {
      to_name: name || 'Student',
      to_email: toEmail,
      course_title: certificateDetails.courseTitle,
      certificate_id: certificateDetails.certificateId,
      verification_url: certificateDetails.verificationUrl,
    },
  });
}
