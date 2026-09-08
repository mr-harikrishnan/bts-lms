import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Course } from '../src/models/Course.js';
import { Module } from '../src/models/Module.js';
import { Lesson } from '../src/models/Lesson.js';
import { Test } from '../src/models/Test.js';
import { User } from '../src/models/User.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES } from '../src/constants/roles.js';

describe('Course Curriculum & Assessment API Tests', () => {
  let sampleCourse: any;
  let sampleModule: any;
  let sampleLesson: any;
  let sampleTest: any;
  let studentUser: any;
  let studentToken: string;

  before(async () => {
    await connectDatabase();

    studentUser = await User.create({
      name: 'Course Student',
      email: 'course.student@test.com',
      password: 'password123',
      role: ROLES.STUDENT,
    });

    studentToken = generateAccessToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    sampleCourse = await Course.create({
      title: 'Advanced Cloud Data Pipelines',
      category: 'Web Development',
      level: 'Advanced',
      duration: '8 Weeks',
      price: 1999,
      originalPrice: 3999,
      description: 'Distributed streaming pipelines with Kafka and Spark.',
      thumbnail: 'thumb.jpg',
      instructor: { name: 'Cloud Lead', title: 'Architect', avatar: 'av.jpg' },
      featured: true,
    });

    sampleModule = await Module.create({
      courseId: sampleCourse._id,
      moduleNumber: 'Module 01',
      title: 'Streaming Fundamentals',
      order: 0,
    });

    sampleLesson = await Lesson.create({
      courseId: sampleCourse._id,
      moduleId: sampleModule._id,
      lessonNumber: '1.1',
      title: 'Event Brokering & Partitions',
      duration: '45m',
      overview: ['Partitions', 'Offsets'],
      takeaways: [{ title: 'Partitioning', desc: 'Distributes load' }],
      order: 0,
    });

    sampleTest = await Test.create({
      courseId: sampleCourse._id,
      title: 'Cloud Certification Test',
      passingScore: 70,
      questions: [
        {
          question: 'What guarantees ordering in Kafka?',
          options: ['Consumer group', 'Within a partition', 'Across topics', 'None'],
          correctIndex: 1,
          explanation: 'Kafka guarantees total order within a single partition.',
        },
      ],
    });
  });

  after(async () => {
    await User.deleteMany({ email: 'course.student@test.com' });
    if (sampleCourse) {
      await Course.findByIdAndDelete(sampleCourse._id);
      await Module.deleteMany({ courseId: sampleCourse._id });
      await Lesson.deleteMany({ courseId: sampleCourse._id });
      await Test.deleteMany({ courseId: sampleCourse._id });
    }
    await disconnectDatabase();
  });

  test('GET /api/v1/courses should return list of courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('GET /api/v1/courses/:courseId should return full curriculum with modules and lessons', async () => {
    const res = await request(app).get(`/api/v1/courses/${sampleCourse._id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data._id, sampleCourse._id.toString());
    assert.ok(Array.isArray(res.body.data.modules));
    assert.strictEqual(res.body.data.modules.length, 1);
    assert.strictEqual(res.body.data.modules[0].lessons.length, 1);
  });

  test('GET /api/v1/courses/:courseId/test should withhold answer keys from student', async () => {
    const res = await request(app)
      .get(`/api/v1/courses/${sampleCourse._id}/test`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.questions.length, 1);
    // Security check: correctIndex and explanation must be stripped
    assert.strictEqual(res.body.data.questions[0].correctIndex, undefined);
    assert.strictEqual(res.body.data.questions[0].explanation, undefined);
  });
});
