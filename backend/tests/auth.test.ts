import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';

describe('Authentication & Security API Tests', () => {
  before(async () => {
    await connectDatabase();
    // Clean test user if exists
    await User.deleteMany({ email: 'test.student.auth@example.com' });
  });

  after(async () => {
    await User.deleteMany({ email: 'test.student.auth@example.com' });
    await disconnectDatabase();
  });

  test('POST /api/v1/auth/signup should register a new student user and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Test Student Auth',
        email: 'test.student.auth@example.com',
        password: 'Password123!',
        college: 'Test University',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.accessToken);
    assert.strictEqual(res.body.data.user.email, 'test.student.auth@example.com');
    assert.strictEqual(res.body.data.user.role, 'student');
    assert.strictEqual(res.body.data.user.password, undefined); // Password never exposed
  });

  test('POST /api/v1/auth/signup should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Another User',
        email: 'test.student.auth@example.com',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test.student.auth@example.com',
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/v1/auth/login should authenticate valid credentials and issue tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test.student.auth@example.com',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.accessToken);
    assert.ok(res.headers['set-cookie']);
  });

  test('GET /api/v1/auth/me without token should return 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    assert.strictEqual(res.status, 401);
  });
});
