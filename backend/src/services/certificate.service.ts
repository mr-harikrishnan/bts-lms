import crypto from 'crypto';
import { Certificate } from '../models/Certificate.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { toObjectId } from '../utils/objectId.js';
import { ROLES } from '../constants/roles.js';

export async function getUserCertificates(userId: string) {
  return Certificate.find({ userId: toObjectId(userId) }).sort({ issueDate: -1 });
}

export async function getCertificateById(
  certificateId: string,
  requestingUserId: string,
  requestingUserRole: string
) {
  const cert = await Certificate.findById(toObjectId(certificateId));
  if (!cert) {
    const error: any = new Error(`Certificate with ID '${certificateId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // IDOR protection: only owner or admin can view
  if (cert.userId.toString() !== requestingUserId && requestingUserRole !== ROLES.ADMIN) {
    const error: any = new Error('Forbidden: You do not have permission to view this certificate.');
    error.statusCode = 403;
    throw error;
  }

  return cert;
}

export async function generateCertificate(userId: string, courseId: string, score: number) {
  const userOid = toObjectId(userId);
  const courseOid = toObjectId(courseId);

  const [user, course] = await Promise.all([
    User.findById(userOid),
    Course.findById(courseOid),
  ]);

  if (!user || !course) {
    const error: any = new Error('User or course not found for certificate generation.');
    error.statusCode = 404;
    throw error;
  }

  // Idempotency: return existing certificate if already issued for this user & course
  const existing = await Certificate.findOne({ userId: userOid, courseId: courseOid });
  if (existing) {
    return existing;
  }

  const categoryAbbr = course.category.slice(0, 3).toUpperCase();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const credentialId = `BTS-${categoryAbbr}-${new Date().getFullYear()}-${randomHex}`;
  const verificationKey = `VKEY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

  let grade = 'B';
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B+';

  const certificate = await Certificate.create({
    userId: userOid,
    courseId: courseOid,
    courseTitle: course.title,
    category: course.category,
    studentName: user.name,
    issueDate: new Date(),
    credentialId,
    score,
    grade,
    verificationKey,
    instructorName: course.instructor.name,
    directorName: 'Karthik Raja',
  });

  return certificate;
}
