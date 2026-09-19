import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Coupon } from '../models/Coupon.js';
import { Test } from '../models/Test.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../constants/roles.js';
import { migrateJsonToMongo } from './migrateJsonToMongo.js';

export async function seedDatabase() {
  console.log('[Seed] Seeding database...');
  await connectDatabase();

  // Create or update Admin account
  const adminPassword = await hashPassword('Admin@123');
  await User.findOneAndUpdate(
    { email: 'admin@gmail.com' },
    {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: ROLES.ADMIN,
      college: 'DLABS Central Administration',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      rollNumber: 'ADM-001',
      grantName: 'Executive Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('[Seed] Verified Administrator account: admin@gmail.com / Admin@123');

  // Seed default 100% free coupon for testing courses
  const course = await Course.findOne();
  if (course) {
    await Coupon.findOneAndUpdate(
      { code: 'FREE100' },
      {
        courseId: course._id,
        code: 'FREE100',
        discountType: 'percentage',
        discountValue: 100,
        maxUses: 1000,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Seed] Created / Verified 'FREE100' coupon for course: '${course.title}' (${course._id})`);

    // Seed default assessment test so /courses/:id/test never 404s
    const existingTest = await Test.findOne({ courseId: course._id });
    if (!existingTest) {
      await Test.create({
        courseId: course._id,
        title: `${course.title} - Final Certification Assessment`,
        timeLimitMinutes: 15,
        passingScore: 70,
        questions: [
          {
            question: 'What is the primary architecture principle emphasized in this curriculum?',
            options: [
              'Scalable micro-modular structure with clean separation of concerns',
              'Monolithic tightly coupled script execution',
              'Direct unvetted production deployment without validation',
              'Stateless non-deterministic execution',
            ],
            correctIndex: 0,
            explanation: 'Clean separation of concerns and modular scalable components ensure maintainable systems.',
          },
          {
            question: 'Which tool is utilized for practical digital skill execution and real-world projects?',
            options: [
              'Command line interface and interactive workflows',
              'Manual static typewriter logs',
              'Uncompiled source fragments',
              'None of the above',
            ],
            correctIndex: 0,
            explanation: 'Modern interactive workflows empower students with industry-ready skills.',
          },
          {
            question: 'How do you verify completed lessons in the course curriculum?',
            options: [
              'By watching lessons and completing progress milestones',
              'By skipping all chapters',
              'By logging out permanently',
              'By deleting the course',
            ],
            correctIndex: 0,
            explanation: 'Progress milestones track completed lessons and unlock your verified certificate.',
          },
        ],
      });
      console.log(`[Seed] Created test assessment for course: '${course.title}'`);
    }
  }

  console.log('[Seed] Database user, coupon, and assessment verification completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seedDatabase.ts')) {
  seedDatabase()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    });
}
