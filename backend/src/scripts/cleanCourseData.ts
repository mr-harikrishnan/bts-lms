import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { Certificate } from '../models/Certificate.js';
import { Test } from '../models/Test.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { WebhookEvent } from '../models/WebhookEvent.js';

export async function cleanCourseData() {
  console.log('[Cleanup] Connecting to database...');
  await connectDatabase();

  console.log('[Cleanup] Removing all Courses...');
  const courseRes = await Course.deleteMany({});
  console.log(`[Cleanup] Deleted ${courseRes.deletedCount} courses.`);

  console.log('[Cleanup] Removing all Modules...');
  const modRes = await Module.deleteMany({});
  console.log(`[Cleanup] Deleted ${modRes.deletedCount} modules.`);

  console.log('[Cleanup] Removing all Lessons...');
  const lessonRes = await Lesson.deleteMany({});
  console.log(`[Cleanup] Deleted ${lessonRes.deletedCount} lessons.`);

  console.log('[Cleanup] Removing all Tests...');
  const testRes = await Test.deleteMany({});
  console.log(`[Cleanup] Deleted ${testRes.deletedCount} tests.`);

  console.log('[Cleanup] Removing all Enrollments...');
  const enrollRes = await Enrollment.deleteMany({});
  console.log(`[Cleanup] Deleted ${enrollRes.deletedCount} enrollments.`);

  console.log('[Cleanup] Removing all Certificates...');
  const certRes = await Certificate.deleteMany({});
  console.log(`[Cleanup] Deleted ${certRes.deletedCount} certificates.`);

  console.log('[Cleanup] Removing all Orders...');
  const orderRes = await Order.deleteMany({});
  console.log(`[Cleanup] Deleted ${orderRes.deletedCount} orders.`);

  console.log('[Cleanup] Removing all Payments...');
  const payRes = await Payment.deleteMany({});
  console.log(`[Cleanup] Deleted ${payRes.deletedCount} payments.`);

  console.log('[Cleanup] Removing all WebhookEvents...');
  const whRes = await WebhookEvent.deleteMany({});
  console.log(`[Cleanup] Deleted ${whRes.deletedCount} webhook events.`);

  const users = await User.find({}, 'name email role');
  console.log('[Cleanup] Preserved User Accounts in DB:', JSON.stringify(users, null, 2));

  console.log('✅ [Cleanup] All course-related data removed! Only user data remains.');
  await disconnectDatabase();
}

cleanCourseData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Cleanup] Error:', err);
    process.exit(1);
  });
