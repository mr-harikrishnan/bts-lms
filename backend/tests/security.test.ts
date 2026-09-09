import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import crypto from 'crypto';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Module } from '../src/models/Module.js';
import { Lesson } from '../src/models/Lesson.js';
import { Order } from '../src/models/Order.js';
import { Payment } from '../src/models/Payment.js';
import { Enrollment } from '../src/models/Enrollment.js';
import { ROLES } from '../src/constants/roles.js';
import { generateAccessToken } from '../src/utils/token.js';
import { env } from '../src/config/env.js';
import { razorpayInstance } from '../src/config/razorpay.js';

describe('Comprehensive Production Security & Authorization Tests', () => {
  let studentUser: any;
  let studentToken: string;
  let secondStudentUser: any;
  let secondStudentToken: string;
  let adminUser: any;
  let adminToken: string;

  let paidCourse: any;
  let freeCourse: any;
  let otherCourse: any;
  let paidModule: any;
  let paidLesson: any;
  let otherLesson: any;

  before(async () => {
    await connectDatabase();

    // Stub Razorpay order creation for offline tests
    razorpayInstance.orders.create = (async (options: any) => {
      return {
        id: `order_sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
      };
    }) as any;

    // Normal student 1
    studentUser = await User.create({
      name: 'Security Student',
      email: 'sec.student@test.com',
      password: '$2a$10$abcdefghijklmnopqrstuvw123456789012345678901234567890',
      role: ROLES.STUDENT,
    });
    studentToken = generateAccessToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // Normal student 2 (for cross-user tests)
    secondStudentUser = await User.create({
      name: 'Second Student',
      email: 'second.student@test.com',
      password: '$2a$10$abcdefghijklmnopqrstuvw123456789012345678901234567890',
      role: ROLES.STUDENT,
    });
    secondStudentToken = generateAccessToken({
      userId: secondStudentUser._id.toString(),
      email: secondStudentUser.email,
      role: secondStudentUser.role,
    });

    // Admin user
    adminUser = await User.create({
      name: 'Security Admin',
      email: 'sec.admin@test.com',
      password: '$2a$10$abcdefghijklmnopqrstuvw123456789012345678901234567890',
      role: ROLES.ADMIN,
    });
    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // Paid Course
    paidCourse = await Course.create({
      title: 'Production Security Masterclass',
      category: 'Web Development',
      level: 'Advanced',
      duration: '6 Weeks',
      price: 2999,
      originalPrice: 4999,
      description: 'Zero-trust architecture and secure coding in enterprise apps.',
      thumbnail: 'sec.jpg',
      instructor: { name: 'Sec Lead', title: 'Principal', avatar: 'sec.jpg' },
    });

    paidModule = await Module.create({
      courseId: paidCourse._id,
      moduleNumber: 'Module 01',
      title: 'Threat Modeling',
      order: 0,
    });

    paidLesson = await Lesson.create({
      courseId: paidCourse._id,
      moduleId: paidModule._id,
      lessonNumber: '1.1',
      title: 'Zero-Trust Verification',
      duration: '30m',
      videoUrl: 'https://cdn.bstorm.edu/secure/vault/lesson-1-1.mp4',
      order: 0,
    });

    // Free Course
    freeCourse = await Course.create({
      title: 'Introduction to Open Source',
      category: 'Content Creation',
      level: 'Beginner-Friendly',
      duration: '1 Week',
      price: 0,
      originalPrice: 0,
      description: 'Free introductory course.',
      thumbnail: 'free.jpg',
      instructor: { name: 'Free Lead', title: 'Guide', avatar: 'free.jpg' },
    });

    // Another course for cross-course validation
    otherCourse = await Course.create({
      title: 'Separate Track Course',
      category: 'Digital Marketing',
      level: 'Beginner-Friendly',
      duration: '2 Weeks',
      price: 1999,
      originalPrice: 2999,
      description: 'Separate course.',
      thumbnail: 'other.jpg',
      instructor: { name: 'Other', title: 'Instructor', avatar: 'other.jpg' },
    });



    otherLesson = await Lesson.create({
      courseId: otherCourse._id,
      moduleId: paidModule._id,
      lessonNumber: '1.1',
      title: 'Unrelated Lesson',
      duration: '20m',
      order: 0,
    });
  });

  after(async () => {
    await User.deleteMany({ email: { $in: ['sec.student@test.com', 'second.student@test.com', 'sec.admin@test.com'] } });
    if (paidCourse) await Course.findByIdAndDelete(paidCourse._id);
    if (freeCourse) await Course.findByIdAndDelete(freeCourse._id);
    if (otherCourse) await Course.findByIdAndDelete(otherCourse._id);
    if (paidModule) await Module.findByIdAndDelete(paidModule._id);
    if (paidLesson) await Lesson.findByIdAndDelete(paidLesson._id);
    if (otherLesson) await Lesson.findByIdAndDelete(otherLesson._id);
    await Order.deleteMany({ userId: { $in: [studentUser?._id, secondStudentUser?._id] } });
    await Payment.deleteMany({ userId: { $in: [studentUser?._id, secondStudentUser?._id] } });
    await Enrollment.deleteMany({ userId: { $in: [studentUser?._id, secondStudentUser?._id] } });
    await disconnectDatabase();
  });

  // --- CONTENT ACCESS & AUTHORIZATION TESTS ---

  test('GET /api/v1/courses/:courseId/lessons should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get(`/api/v1/courses/${paidCourse._id}/lessons`);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /api/v1/courses/:courseId/lessons should reject non-enrolled students with 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${paidCourse._id}/lessons`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /api/v1/courses/:courseId/lessons/:lessonId should reject cross-course access with 404', async () => {
    // requesting otherLesson under paidCourse ID
    const res = await request(app)
      .get(`/api/v1/courses/${paidCourse._id}/lessons/${otherLesson._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 404);
  });

  test('GET /api/v1/lessons/:id should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get(`/api/v1/lessons/${paidLesson._id}`);
    assert.strictEqual(res.status, 401);
  });

  test('GET /api/v1/courses/:courseId should strip private videoUrl from curriculum for public preview', async () => {
    const res = await request(app).get(`/api/v1/courses/${paidCourse._id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    // Verified: videoUrl must be stripped from public syllabus!
    assert.strictEqual(res.body.data.modules[0].lessons[0].videoUrl, undefined);
  });

  // --- PAYMENT BYPASS & ENROLLMENT TESTS ---

  test('POST /api/v1/courses/:courseId/enroll should reject direct enrollment on paid course with 402', async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${paidCourse._id}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 402);
    assert.strictEqual(res.body.success, false);

    // Verify enrollment was NOT created
    const enrollment = await Enrollment.findOne({
      userId: studentUser._id,
      courseId: paidCourse._id,
    });
    assert.strictEqual(enrollment, null);
  });

  test('POST /api/v1/courses/:courseId/enroll should allow direct enrollment for free course', async () => {
    const res = await request(app)
      .post(`/api/v1/courses/${freeCourse._id}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);

    const enrollment = await Enrollment.findOne({
      userId: studentUser._id,
      courseId: freeCourse._id,
    });
    assert.ok(enrollment);
  });

  test('POST /api/v1/payments/orders should reject mock order fallback and fail cleanly when Razorpay fails', async () => {
    // Simulate gateway outage
    const originalCreate = razorpayInstance.orders.create;
    razorpayInstance.orders.create = (async () => {
      throw new Error('Razorpay network timeout connection refused');
    }) as any;

    const res = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: paidCourse._id.toString() });

    // Restore stub
    razorpayInstance.orders.create = originalCreate;

    assert.strictEqual(res.status, 502);
    assert.strictEqual(res.body.success, false);
    // Verified: No mock order returned!
    assert.strictEqual(res.body.data, undefined);
  });

  test('POST /api/v1/payments/verify with forged signature should not grant enrollment', async () => {
    const orderRes = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: paidCourse._id.toString() });

    const razorpayOrderId = orderRes.body.data.razorpayOrderId;

    const verifyRes = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        razorpayOrderId,
        razorpayPaymentId: 'pay_tampered_12345',
        razorpaySignature: 'invalid_forged_signature_hex',
      });

    assert.strictEqual(verifyRes.status, 400);

    const enrollment = await Enrollment.findOne({
      userId: studentUser._id,
      courseId: paidCourse._id,
    });
    assert.strictEqual(enrollment, null);
  });

  test('POST /api/v1/payments/verify with genuine signature should enroll user and allow lesson access', async () => {
    const orderRes = await request(app)
      .post('/api/v1/payments/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: paidCourse._id.toString() });

    const razorpayOrderId = orderRes.body.data.razorpayOrderId;
    const paymentId = `pay_valid_${Date.now()}`;

    const text = `${razorpayOrderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const verifyRes = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.body.data.verified, true);

    // Enrolled user can now access paid lessons!
    const lessonRes = await request(app)
      .get(`/api/v1/courses/${paidCourse._id}/lessons`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(lessonRes.status, 200);
    assert.strictEqual(lessonRes.body.success, true);
    assert.ok(lessonRes.body.data.length > 0);
  });

  // --- PASSWORD RESET TESTS ---

  test('POST /api/v1/auth/forgot-password should not reveal whether email exists', async () => {
    // Test with non-existing email
    const res1 = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent.user.12345@test.com' });

    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.success, true);
    assert.ok(res1.body.data.message.includes('password reset link has been sent'));

    // Test with registered email
    const res2 = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: studentUser.email });

    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.success, true);
    assert.strictEqual(res1.body.data.message, res2.body.data.message);
  });

  test('POST /api/v1/auth/reset-password should reject invalid/expired token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: 'invalid_or_expired_hex_token_1234567890',
        newPassword: 'NewPassword123!',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/v1/auth/reset-password should successfully reset password and invalidate token', async () => {
    // Generate valid reset token directly for test user
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    studentUser.passwordResetToken = hashedToken;
    studentUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await studentUser.save();

    // First reset: should succeed
    const res1 = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: rawToken,
        newPassword: 'SecureNewPassword123!',
      });

    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.success, true);

    // Second reset with same token: must fail (single-use enforcement)
    const res2 = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: rawToken,
        newPassword: 'AnotherPassword123!',
      });

    assert.strictEqual(res2.status, 400);
  });

  // --- ADMIN AUTHORIZATION TESTS ---

  test('Admin endpoints should reject normal students with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/enrollments')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('Admin endpoints should allow authorized admins with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/admin/enrollments')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.enrollments));
  });

  // --- CORS SECURITY TESTS ---

  test('Production CORS policy should block unauthorized localhost origins', async () => {
    const prevEnv = env.isProduction;
    env.isProduction = true;

    const res = await request(app)
      .get('/api/v1/courses')
      .set('Origin', 'http://localhost:3000');

    env.isProduction = prevEnv;

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });
});

