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
import { Enrollment } from '../src/models/Enrollment.js';
import { Certificate } from '../src/models/Certificate.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES } from '../src/constants/roles.js';

describe('Comprehensive CRUD & Validation Suite for All Collections', () => {
  let adminUser: any;
  let adminToken: string;
  let studentUser: any;
  let studentToken: string;

  before(async () => {
    await connectDatabase();

    adminUser = await User.create({
      name: 'Super Admin Tester',
      email: 'superadmin.crud@test.com',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
    });

    studentUser = await User.create({
      name: 'Regular Learner',
      email: 'learner.crud@test.com',
      password: 'LearnerPassword123!',
      role: ROLES.STUDENT,
    });

    adminToken = generateAccessToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    studentToken = generateAccessToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });
  });

  after(async () => {
    // Cleanup created test records
    await Course.deleteMany({ title: /Test Course CRUD/i });
    await User.deleteMany({ email: /crud@test\.com/i });
    await disconnectDatabase();
  });

  // =========================================================================
  // 1. COURSE CRUD & VALIDATION
  // =========================================================================
  describe('Course Collection CRUD & Validation', () => {
    let createdCourseId: string;

    test('POST /api/v1/admin/courses should reject invalid payload with 400', async () => {
      const res = await request(app)
        .post('/api/v1/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'AB', // too short (< 3)
          category: 'Invalid Category',
          price: -50,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert(Array.isArray(res.body.errors));
      assert(res.body.errors.some((e: string) => e.includes('title')));
      assert(res.body.errors.some((e: string) => e.includes('category')));
      assert(res.body.errors.some((e: string) => e.includes('price')));
    });

    test('POST /api/v1/admin/courses should create course with valid payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Course CRUD Masterclass',
          category: 'Web Development',
          level: 'Beginner-Friendly',
          duration: '6 Weeks',
          price: 1499,
          originalPrice: 4999,
          description: 'A comprehensive test course for verifying CRUD validation.',
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.title, 'Test Course CRUD Masterclass');
      createdCourseId = res.body.data._id;
    });

    test('GET /api/v1/admin/courses/:id should return the course', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, createdCourseId);
    });

    test('PUT /api/v1/admin/courses/:id should update course fields with validation', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 1999,
          description: 'Updated description for CRUD masterclass.',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.price, 1999);
    });

    test('DELETE /api/v1/admin/courses/:id with invalid ObjectId should fail with 400', async () => {
      const res = await request(app)
        .delete('/api/v1/admin/courses/invalid-id-format')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.code, 'INVALID_OBJECT_ID');
    });
  });

  // =========================================================================
  // 2. MODULE CRUD & VALIDATION
  // =========================================================================
  describe('Module Collection CRUD & Validation', () => {
    let testCourse: any;
    let createdModuleId: string;

    before(async () => {
      testCourse = await Course.create({
        title: 'Test Course CRUD for Modules',
        category: 'Digital Marketing',
        level: 'Intermediate',
        duration: '4 Weeks',
        price: 999,
        originalPrice: 2999,
        description: 'Module test course container.',
        thumbnail: 'thumb.jpg',
        instructor: { name: 'Lead', title: 'Instructor', avatar: 'av.jpg' },
      });
    });

    after(async () => {
      await Course.findByIdAndDelete(testCourse._id);
    });

    test('POST /api/v1/admin/modules should reject missing title/courseId', async () => {
      const res = await request(app)
        .post('/api/v1/admin/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moduleNumber: 'Module 01',
        });

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('courseId')));
      assert(res.body.errors.some((e: string) => e.includes('title')));
    });

    test('POST /api/v1/admin/modules should create module with valid payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/modules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          moduleNumber: 'Module 01',
          title: 'SEO Foundations & Architecture',
          order: 1,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.title, 'SEO Foundations & Architecture');
      createdModuleId = res.body.data._id;
    });

    test('GET /api/v1/admin/modules should list modules', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/modules?courseId=${testCourse._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.data));
      assert(res.body.data.length >= 1);
    });

    test('PUT /api/v1/admin/modules/:id should update module', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/modules/${createdModuleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'SEO Foundations & Technical Audits',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.title, 'SEO Foundations & Technical Audits');
    });

    test('DELETE /api/v1/admin/modules/:id should delete module', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/modules/${createdModuleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await Module.findById(createdModuleId);
      assert.strictEqual(exists, null);
    });
  });

  // =========================================================================
  // 3. LESSON CRUD & VALIDATION
  // =========================================================================
  describe('Lesson Collection CRUD & Validation', () => {
    let testCourse: any;
    let testModule: any;
    let createdLessonId: string;

    before(async () => {
      testCourse = await Course.create({
        title: 'Test Course CRUD for Lessons',
        category: 'Content Creation',
        level: 'Beginner-Friendly',
        duration: '4 Weeks',
        price: 999,
        originalPrice: 2999,
        description: 'Lesson test course container.',
        thumbnail: 'thumb.jpg',
        instructor: { name: 'Lead', title: 'Instructor', avatar: 'av.jpg' },
      });

      testModule = await Module.create({
        courseId: testCourse._id,
        moduleNumber: 'Module 01',
        title: 'Storytelling Fundamentals',
        order: 1,
      });
    });

    after(async () => {
      await Course.findByIdAndDelete(testCourse._id);
      await Module.findByIdAndDelete(testModule._id);
      await Lesson.deleteMany({ courseId: testCourse._id });
    });

    test('POST /api/v1/admin/lessons should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/admin/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          // missing moduleId, lessonNumber, title, duration
        });

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('moduleId')));
      assert(res.body.errors.some((e: string) => e.includes('title')));
    });

    test('POST /api/v1/admin/lessons should create lesson with valid payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/lessons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          moduleId: testModule._id.toString(),
          lessonNumber: '01',
          title: 'The Narrative Arc in Short-form Content',
          duration: '18 mins',
          videoUrl: 'https://example.com/video1.mp4',
          overview: ['Introduction to pacing', 'Retention hacks'],
          takeaways: [{ title: 'Hook first', desc: 'Capture attention in 3 seconds' }],
          order: 1,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.title, 'The Narrative Arc in Short-form Content');
      createdLessonId = res.body.data._id;
    });

    test('GET /api/v1/admin/lessons should list lessons', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/lessons?moduleId=${testModule._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.data));
      assert(res.body.data.length >= 1);
    });

    test('PUT /api/v1/admin/lessons/:id should update lesson duration and title', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/lessons/${createdLessonId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          duration: '22 mins',
          title: 'The Narrative Arc in Short-form Content (Updated)',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.duration, '22 mins');
    });

    test('DELETE /api/v1/admin/lessons/:id should delete lesson', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/lessons/${createdLessonId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await Lesson.findById(createdLessonId);
      assert.strictEqual(exists, null);
    });
  });

  // =========================================================================
  // 4. TEST / QUIZ CRUD & VALIDATION
  // =========================================================================
  describe('Test Collection CRUD & Validation', () => {
    let testCourse: any;
    let createdTestId: string;

    before(async () => {
      testCourse = await Course.create({
        title: 'Test Course CRUD for Tests',
        category: 'Web Development',
        level: 'Intermediate',
        duration: '4 Weeks',
        price: 999,
        originalPrice: 2999,
        description: 'Quiz test course container.',
        thumbnail: 'thumb.jpg',
        instructor: { name: 'Lead', title: 'Instructor', avatar: 'av.jpg' },
      });
    });

    after(async () => {
      await Course.findByIdAndDelete(testCourse._id);
      await Test.deleteMany({ courseId: testCourse._id });
    });

    test('POST /api/v1/admin/tests should reject invalid questions payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/tests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          title: 'Assessment',
          questions: [], // empty questions
        });

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('questions')));
    });

    test('POST /api/v1/admin/tests should create test with valid payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/tests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          title: 'Final Certification Exam',
          timeLimitMinutes: 30,
          passingScore: 75,
          questions: [
            {
              question: 'What is the purpose of React hooks?',
              options: ['State management in functional components', 'Database query execution', 'CSS compiling', 'None of these'],
              correctIndex: 0,
              explanation: 'Hooks allow function components to use state and lifecycle methods.',
            },
          ],
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.title, 'Final Certification Exam');
      createdTestId = res.body.data._id;
    });

    test('PUT /api/v1/admin/tests/:id should update passing score and time limit', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/tests/${createdTestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          passingScore: 80,
          timeLimitMinutes: 45,
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.passingScore, 80);
      assert.strictEqual(res.body.data.timeLimitMinutes, 45);
    });

    test('DELETE /api/v1/admin/tests/:id should delete test', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/tests/${createdTestId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await Test.findById(createdTestId);
      assert.strictEqual(exists, null);
    });
  });

  // =========================================================================
  // 5. USER CRUD & VALIDATION (ADMIN)
  // =========================================================================
  describe('User Collection CRUD & Validation', () => {
    let newUserId: string;

    test('POST /api/v1/admin/users should reject weak password or invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad User',
          email: 'not-an-email',
          password: '123', // too short (< 6)
        });

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('email')));
      assert(res.body.errors.some((e: string) => e.includes('password')));
    });

    test('POST /api/v1/admin/users should create user and hash password', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Newly Created Student',
          email: 'newstudent.crud@test.com',
          password: 'ValidPassword123!',
          role: 'student',
          college: 'PSG College of Technology',
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.name, 'Newly Created Student');
      assert.strictEqual(res.body.data.password, undefined); // should not be exposed
      newUserId = res.body.data._id;
    });

    test('GET /api/v1/admin/users/:userId should return user details', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, newUserId);
      assert.strictEqual(res.body.data.college, 'PSG College of Technology');
    });

    test('PUT /api/v1/admin/users/:userId should update user profile', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          college: 'CIT Coimbatore',
          district: 'Coimbatore',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.college, 'CIT Coimbatore');
      assert.strictEqual(res.body.data.district, 'Coimbatore');
    });

    test('DELETE /api/v1/admin/users/:userId should delete user', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await User.findById(newUserId);
      assert.strictEqual(exists, null);
    });
  });

  // =========================================================================
  // 6. ENROLLMENT CRUD & VALIDATION
  // =========================================================================
  describe('Enrollment Collection CRUD & Validation', () => {
    let testCourse: any;
    let testStudent: any;
    let createdEnrollmentId: string;

    before(async () => {
      testCourse = await Course.create({
        title: 'Test Course CRUD for Enrollments',
        category: 'Web Development',
        level: 'Beginner-Friendly',
        duration: '4 Weeks',
        price: 999,
        originalPrice: 2999,
        description: 'Enrollment test container.',
        thumbnail: 'thumb.jpg',
        instructor: { name: 'Lead', title: 'Instructor', avatar: 'av.jpg' },
      });

      testStudent = await User.create({
        name: 'Enrollment Target Student',
        email: 'target.student.crud@test.com',
        password: 'Password123!',
        role: ROLES.STUDENT,
      });
    });

    after(async () => {
      await Course.findByIdAndDelete(testCourse._id);
      await User.findByIdAndDelete(testStudent._id);
      await Enrollment.deleteMany({ courseId: testCourse._id });
    });

    test('POST /api/v1/admin/enrollments should reject missing courseId or user identifier', async () => {
      const res = await request(app)
        .post('/api/v1/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('courseId')));
    });

    test('POST /api/v1/admin/enrollments should create enrollment via valid user email', async () => {
      const res = await request(app)
        .post('/api/v1/admin/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: testCourse._id.toString(),
          userEmail: testStudent.email,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.courseId, testCourse._id.toString());
      createdEnrollmentId = res.body.data._id;
    });

    test('GET /api/v1/admin/enrollments/:id should return enrollment details', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/enrollments/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, createdEnrollmentId);
    });

    test('PUT /api/v1/admin/enrollments/:id should update progress and completion status', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/enrollments/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isCompleted: true,
          testScore: 92,
          testPassed: true,
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.isCompleted, true);
      assert.strictEqual(res.body.data.testScore, 92);
    });

    test('DELETE /api/v1/admin/enrollments/:id should revoke enrollment', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/enrollments/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await Enrollment.findById(createdEnrollmentId);
      assert.strictEqual(exists, null);
    });
  });

  // =========================================================================
  // 7. CERTIFICATE CRUD & VALIDATION
  // =========================================================================
  describe('Certificate Collection CRUD & Validation', () => {
    let testCourse: any;
    let testStudent: any;
    let createdCertId: string;

    before(async () => {
      testCourse = await Course.create({
        title: 'Test Course CRUD for Certificates',
        category: 'Digital Marketing',
        level: 'Advanced',
        duration: '10 Weeks',
        price: 2499,
        originalPrice: 4999,
        description: 'Cert test course container.',
        thumbnail: 'thumb.jpg',
        instructor: { name: 'Dr. Marketing', title: 'Dean', avatar: 'av.jpg' },
      });

      testStudent = await User.create({
        name: 'Certificate Student Candidate',
        email: 'cert.candidate.crud@test.com',
        password: 'Password123!',
        role: ROLES.STUDENT,
      });
    });

    after(async () => {
      await Course.findByIdAndDelete(testCourse._id);
      await User.findByIdAndDelete(testStudent._id);
      await Certificate.deleteMany({ courseId: testCourse._id });
    });

    test('POST /api/v1/admin/certificates should reject invalid score or missing user/course', async () => {
      const res = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          score: 150, // invalid > 100
        });

      assert.strictEqual(res.status, 400);
      assert(res.body.errors.some((e: string) => e.includes('userId')));
      assert(res.body.errors.some((e: string) => e.includes('score')));
    });

    test('POST /api/v1/admin/certificates should issue certificate and auto-generate credentials', async () => {
      const res = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testStudent._id.toString(),
          courseId: testCourse._id.toString(),
          score: 95,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.data.studentName, 'Certificate Student Candidate');
      assert.strictEqual(res.body.data.grade, 'A+');
      assert(res.body.data.credentialId.startsWith('BTS-DIG'));
      assert(res.body.data.verificationKey.startsWith('VKEY-'));
      createdCertId = res.body.data._id;
    });

    test('GET /api/v1/admin/certificates should list certificates', async () => {
      const res = await request(app)
        .get('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.data.certificates));
      assert(res.body.data.certificates.length >= 1);
    });

    test('GET /api/v1/admin/certificates/:id should retrieve certificate', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data._id, createdCertId);
    });

    test('PUT /api/v1/admin/certificates/:id should update grade and director details', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grade: 'A++',
          directorName: 'Karthik Raja BTS',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.grade, 'A++');
      assert.strictEqual(res.body.data.directorName, 'Karthik Raja BTS');
    });

    test('DELETE /api/v1/admin/certificates/:id should revoke certificate', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      const exists = await Certificate.findById(createdCertId);
      assert.strictEqual(exists, null);
    });
  });
});
