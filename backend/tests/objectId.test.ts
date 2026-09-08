import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('Pre-emptive MongoDB ObjectId Validation Tests', () => {
  before(async () => {
    await connectDatabase();
  });

  after(async () => {
    await disconnectDatabase();
  });

  const endpointsToTest = [
    { method: 'get', url: '/api/v1/courses/invalid-id' },
    { method: 'get', url: '/api/v1/courses/course-1234' },
    { method: 'get', url: '/api/v1/courses/invalid-id/modules' },
    { method: 'get', url: '/api/v1/courses/invalid-id/lessons' },
    { method: 'get', url: '/api/v1/courses/68a1c0000000000000000001/lessons/bad-lesson' },
    { method: 'get', url: '/api/v1/modules/not-an-oid' },
    { method: 'get', url: '/api/v1/lessons/short-id' },
    { method: 'get', url: '/api/v1/users/user-abc' },
  ];

  for (const ep of endpointsToTest) {
    test(`${ep.method.toUpperCase()} ${ep.url} should reject non-ObjectId with HTTP 400`, async () => {
      const res = await (request(app) as any)[ep.method](ep.url);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, 'INVALID_OBJECT_ID');
    });
  }
});
