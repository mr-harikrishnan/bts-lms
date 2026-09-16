import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Course } from '../src/models/Course.js';
import { User } from '../src/models/User.js';
import { Coupon } from '../src/models/Coupon.js';
import { Enrollment } from '../src/models/Enrollment.js';
import { Payment } from '../src/models/Payment.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES } from '../src/constants/roles.js';

describe('Coupon System & Zero-Payment Enrollment Tests', () => {
  let adminUser: any;
  let adminToken: string;
  let studentUser: any;
  let studentToken: string;
  let testCourse: any;

  before(async () => {
    await connectDatabase();

    // Clean test artifacts
    await User.deleteMany({ email: { $in: ['admin.coupon@test.com', 'student.coupon@test.com'] } });

    adminUser = await User.create({
      name: 'Admin Coupon Master',
      email: 'admin.coupon@test.com',
      password: 'password123',
      role: ROLES.ADMIN,
    });
    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    studentUser = await User.create({
      name: 'Student Coupon Learner',
      email: 'student.coupon@test.com',
      password: 'password123',
      role: ROLES.STUDENT,
    });
    studentToken = generateAccessToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    testCourse = await Course.create({
      title: 'Full-Stack Coupon Mastery Course',
      category: 'Web Development',
      level: 'Intermediate',
      price: 2000,
      originalPrice: 4000,
      duration: '4 Weeks',
      description: 'Comprehensive course to test coupon redemption and zero-price flows.',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      instructor: {
        name: 'Karthik Raja',
        title: 'Lead Instructor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256',
      },
      skills: ['React', 'Node.js'],
    });
  });

  after(async () => {
    if (testCourse) {
      await Course.findByIdAndDelete(testCourse._id);
      await Coupon.deleteMany({ courseId: testCourse._id });
      await Enrollment.deleteMany({ courseId: testCourse._id });
      await Payment.deleteMany({ courseId: testCourse._id });
    }
    await User.deleteMany({ email: { $in: ['admin.coupon@test.com', 'student.coupon@test.com'] } });
    await disconnectDatabase();
  });

  test('POST /api/v1/admin/coupons should create coupon with custom code and fixed 0 price', async () => {
    const res = await request(app)
      .post('/api/v1/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseId: testCourse._id.toString(),
        code: 'FREE100',
        discountType: 'fixed',
        discountValue: 0,
        maxUses: 50,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.code, 'FREE100');
    assert.strictEqual(res.body.data.discountValue, 0);
  });

  test('POST /api/v1/admin/coupons should auto-generate random 6-character uppercase code if omitted', async () => {
    const res = await request(app)
      .post('/api/v1/admin/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        courseId: testCourse._id.toString(),
        // code left blank
        discountType: 'amount',
        discountValue: 500,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert(typeof res.body.data.code === 'string');
    assert.strictEqual(res.body.data.code.length, 6);
    assert.strictEqual(res.body.data.code, res.body.data.code.toUpperCase());
  });

  test('POST /api/v1/coupons/validate should validate coupon and compute 0 price for FREE100', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({
        courseId: testCourse._id.toString(),
        code: 'free100', // test case-insensitivity
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.valid, true);
    assert.strictEqual(res.body.data.finalPrice, 0);
    assert.strictEqual(res.body.data.isFree, true);
    assert.strictEqual(res.body.data.discountAmount, 2000);
  });

  test('POST /api/v1/coupons/validate should reject invalid coupon code', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/validate')
      .send({
        courseId: testCourse._id.toString(),
        code: 'DOESNOTEXIST',
      });

    assert.strictEqual(res.status, 404);
  });

  test('POST /api/v1/coupons/redeem-free should allow student to enroll instantly with 0 rupees', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/redeem-free')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId: testCourse._id.toString(),
        code: 'FREE100',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);

    // Verify enrollment created in database
    const enrollment = await Enrollment.findOne({
      userId: studentUser._id,
      courseId: testCourse._id,
    });
    assert(enrollment);

    // Verify zero-rupee audit payment record created
    const payment = await Payment.findOne({
      userId: studentUser._id,
      courseId: testCourse._id,
      method: 'COUPON_FREE',
    });
    assert(payment);
    assert.strictEqual(payment.amount, 0);

    // Verify coupon usedCount incremented
    const updatedCoupon = await Coupon.findOne({ code: 'FREE100' });
    assert.strictEqual(updatedCoupon?.usedCount, 1);
  });

  test('POST /api/v1/coupons/redeem-free should prevent duplicate enrollment', async () => {
    const res = await request(app)
      .post('/api/v1/coupons/redeem-free')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId: testCourse._id.toString(),
        code: 'FREE100',
      });

    assert.strictEqual(res.status, 409);
  });
});
