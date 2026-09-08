import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { Certificate } from '../models/Certificate.js';
import { Test } from '../models/Test.js';
import { toObjectId } from '../utils/objectId.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../constants/roles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../frontend/src/data');

function readJsonFile(filename: string): any[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[Migration] File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function migrateJsonToMongo() {
  console.log('[Migration] Starting JSON to MongoDB migration...');
  const conn = await connectDatabase();
  if (!conn) {
    console.error('[Migration] Failed to connect to MongoDB. Aborting.');
    return;
  }

  // 1. Users
  const rawUsers = readJsonFile('users.json');
  console.log(`[Migration] Migrating ${rawUsers.length} Users...`);
  for (const u of rawUsers) {
    const hashedPassword = await hashPassword(u.password || 'password123');
    await User.findByIdAndUpdate(
      toObjectId(u._id),
      {
        _id: toObjectId(u._id),
        name: u.name,
        email: u.email.toLowerCase().trim(),
        password: hashedPassword,
        role: u.role || (u.email.includes('admin') ? ROLES.ADMIN : ROLES.STUDENT),
        college: u.college || '',
        district: u.district || '',
        state: u.state || '',
        rollNumber: u.rollNumber || '',
        grantName: u.grantName || '',
        avatar: u.avatar || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 2. Courses
  const rawCourses = readJsonFile('courses.json');
  console.log(`[Migration] Migrating ${rawCourses.length} Courses...`);
  for (const c of rawCourses) {
    await Course.findByIdAndUpdate(
      toObjectId(c._id),
      {
        _id: toObjectId(c._id),
        title: c.title,
        category: c.category,
        level: c.level,
        duration: c.duration,
        durationWeeks: c.durationWeeks || 0,
        hoursLive: c.hoursLive || 0,
        lessonCount: c.lessonCount || 0,
        rating: c.rating || 4.8,
        reviewsCount: c.reviewsCount || 0,
        description: c.description,
        thumbnail: c.thumbnail,
        instructor: c.instructor,
        originalPrice: c.originalPrice,
        price: c.price,
        discountPercent: c.discountPercent || 0,
        capstoneTitle: c.capstoneTitle || '',
        capstoneDesc: c.capstoneDesc || '',
        skills: c.skills || [],
        featured: c.featured || false,
        isUpcoming: c.isUpcoming || false,
        previewVideoUrl: c.previewVideoUrl || '',
        videoUrl: c.videoUrl || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 3. Modules
  const rawModules = readJsonFile('modules.json');
  console.log(`[Migration] Migrating ${rawModules.length} Modules...`);
  for (let i = 0; i < rawModules.length; i++) {
    const m = rawModules[i];
    await Module.findByIdAndUpdate(
      toObjectId(m._id),
      {
        _id: toObjectId(m._id),
        courseId: toObjectId(m.courseId),
        moduleNumber: m.moduleNumber,
        title: m.title,
        order: i,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 4. Lessons
  const rawLessons = readJsonFile('lessons.json');
  console.log(`[Migration] Migrating ${rawLessons.length} Lessons...`);
  for (let i = 0; i < rawLessons.length; i++) {
    const l = rawLessons[i];
    await Lesson.findByIdAndUpdate(
      toObjectId(l._id),
      {
        _id: toObjectId(l._id),
        courseId: toObjectId(l.courseId),
        moduleId: toObjectId(l.moduleId),
        lessonNumber: l.lessonNumber,
        title: l.title,
        duration: l.duration,
        videoUrl: l.videoUrl || '',
        overview: l.overview || [],
        takeaways: l.takeaways || [],
        order: i,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 5. Enrollments
  const rawEnrollments = readJsonFile('enrollments.json');
  console.log(`[Migration] Migrating ${rawEnrollments.length} Enrollments...`);
  for (const e of rawEnrollments) {
    await Enrollment.findByIdAndUpdate(
      toObjectId(e._id),
      {
        _id: toObjectId(e._id),
        userId: toObjectId(e.userId),
        courseId: toObjectId(e.courseId),
        enrolledAt: e.enrolledAt ? new Date(e.enrolledAt) : new Date(),
        completedLessonIds: (e.completedLessonIds || []).map((id: string) => toObjectId(id)),
        currentLessonId: e.currentLessonId ? toObjectId(e.currentLessonId) : undefined,
        isCompleted: e.isCompleted || false,
        testScore: e.testScore,
        testPassed: e.testPassed,
        certificateId: e.certificateId ? toObjectId(e.certificateId) : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 6. Certificates
  const rawCertificates = readJsonFile('certificates.json');
  console.log(`[Migration] Migrating ${rawCertificates.length} Certificates...`);
  for (const cert of rawCertificates) {
    await Certificate.findByIdAndUpdate(
      toObjectId(cert._id),
      {
        _id: toObjectId(cert._id),
        userId: toObjectId(cert.userId),
        courseId: toObjectId(cert.courseId),
        courseTitle: cert.courseTitle,
        category: cert.category,
        studentName: cert.studentName,
        issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
        credentialId: cert.credentialId,
        score: cert.score,
        grade: cert.grade,
        verificationKey: cert.verificationKey,
        instructorName: cert.instructorName,
        directorName: cert.directorName,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 7. Tests
  const rawTests = readJsonFile('tests.json');
  console.log(`[Migration] Migrating ${rawTests.length} Tests...`);
  for (const t of rawTests) {
    await Test.findByIdAndUpdate(
      toObjectId(t._id),
      {
        _id: toObjectId(t._id),
        courseId: toObjectId(t.courseId),
        title: t.title,
        timeLimitMinutes: t.timeLimitMinutes,
        passingScore: t.passingScore,
        questions: (t.questions || []).map((q: any) => ({
          _id: toObjectId(q._id),
          question: q.question,
          codeSnippet: q.codeSnippet || '',
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('\n✅ [Migration] Complete! All JSON data has been safely imported into MongoDB.');
  await disconnectDatabase();
}

// Execute directly when run as script
if (process.argv[1] && process.argv[1].endsWith('migrateJsonToMongo.ts')) {
  migrateJsonToMongo().catch((err) => {
    console.error('[Migration] Failed with error:', err);
    process.exit(1);
  });
}
