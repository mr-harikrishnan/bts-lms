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

async function cleanDatabase() {
  console.log('[Cleanup] Connecting to MongoDB...');
  const conn = await connectDatabase();
  if (!conn) {
    console.error('[Cleanup] Could not connect to database.');
    process.exit(1);
  }

  console.log('[Cleanup] Removing all users...');
  const userRes = await User.deleteMany({});
  console.log(`[Cleanup] Deleted ${userRes.deletedCount} users.`);

  console.log('[Cleanup] Removing all courses...');
  const courseRes = await Course.deleteMany({});
  console.log(`[Cleanup] Deleted ${courseRes.deletedCount} courses.`);

  console.log('[Cleanup] Removing modules...');
  const modRes = await Module.deleteMany({});
  console.log(`[Cleanup] Deleted ${modRes.deletedCount} modules.`);

  console.log('[Cleanup] Removing lessons...');
  const lessonRes = await Lesson.deleteMany({});
  console.log(`[Cleanup] Deleted ${lessonRes.deletedCount} lessons.`);

  console.log('[Cleanup] Removing enrollments...');
  const enrollRes = await Enrollment.deleteMany({});
  console.log(`[Cleanup] Deleted ${enrollRes.deletedCount} enrollments.`);

  console.log('[Cleanup] Removing certificates...');
  const certRes = await Certificate.deleteMany({});
  console.log(`[Cleanup] Deleted ${certRes.deletedCount} certificates.`);

  console.log('[Cleanup] Removing tests...');
  const testRes = await Test.deleteMany({});
  console.log(`[Cleanup] Deleted ${testRes.deletedCount} tests.`);

  console.log('[Cleanup] Removing orders...');
  const orderRes = await Order.deleteMany({});
  console.log(`[Cleanup] Deleted ${orderRes.deletedCount} orders.`);

  console.log('[Cleanup] Removing payments...');
  const payRes = await Payment.deleteMany({});
  console.log(`[Cleanup] Deleted ${payRes.deletedCount} payments.`);

  console.log('[Cleanup] Removing webhook events...');
  const whRes = await WebhookEvent.deleteMany({});
  console.log(`[Cleanup] Deleted ${whRes.deletedCount} webhook events.`);

  console.log('[Cleanup] All users, courses, and related data successfully removed from database.');
  await disconnectDatabase();
}

cleanDatabase().catch((err) => {
  console.error('[Cleanup] Error during database cleanup:', err);
  process.exit(1);
});
