import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { Certificate } from '../src/models/Certificate.js';
import { Course } from '../src/models/Course.js';
import { ROLES } from '../src/constants/roles.js';
import { generateAccessToken } from '../src/utils/token.js';
import { hashPassword } from '../src/utils/password.js';
import mongoose from 'mongoose';

describe('IDOR & Broken Access Control Tests', () => {
  let studentA: any;
  let studentB: any;
  let adminUser: any;
  let tokenStudentA: string;
  let tokenAdmin: string;
  let certificateB: any;

  before(async () => {
    await connectDatabase();

    const pwd = await hashPassword('password123');

    studentA = await User.create({
      name: 'Student A',
      email: 'student.a@test.com',
      password: pwd,
      role: ROLES.STUDENT,
    });

    studentB = await User.create({
      name: 'Student B',
      email: 'student.b@test.com',
      password: pwd,
      role: ROLES.STUDENT,
    });

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin.boss@test.com',
      password: pwd,
      role: ROLES.ADMIN,
    });

    tokenStudentA = generateAccessToken({
      userId: studentA._id.toString(),
      email: studentA.email,
      role: studentA.role,
    });

    tokenAdmin = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create a certificate owned by Student B
    certificateB = await Certificate.create({
      userId: studentB._id,
      courseId: new mongoose.Types.ObjectId(),
      courseTitle: 'TypeScript Mastery',
      category: 'Web Development',
      studentName: 'Student B',
      credentialId: `BTS-TEST-${Date.now()}`,
      score: 95,
      grade: 'A+',
      verificationKey: `VKEY-${Date.now()}`,
      instructorName: 'Instructor',
      directorName: 'Director',
    });
  });

  after(async () => {
    await User.deleteMany({
      email: { $in: ['student.a@test.com', 'student.b@test.com', 'admin.boss@test.com'] },
    });
    if (certificateB) {
      await Certificate.findByIdAndDelete(certificateB._id);
    }
    await disconnectDatabase();
  });

  test('Student A should NOT be able to view Student B profile (IDOR protection -> 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${studentB._id}`)
      .set('Authorization', `Bearer ${tokenStudentA}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Forbidden/);
  });

  test('Admin SHOULD be able to view Student B profile (RBAC -> 200)', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${studentB._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data._id, studentB._id.toString());
  });

  test('Student A should NOT be able to view Student B certificate (IDOR protection -> 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/user/certificates/${certificateB._id}`)
      .set('Authorization', `Bearer ${tokenStudentA}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('Admin SHOULD be able to view Student B certificate (RBAC -> 200)', async () => {
    const res = await request(app)
      .get(`/api/v1/user/certificates/${certificateB._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
