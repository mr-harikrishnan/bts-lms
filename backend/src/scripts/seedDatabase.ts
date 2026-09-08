import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../constants/roles.js';
import { migrateJsonToMongo } from './migrateJsonToMongo.js';

export async function seedDatabase() {
  console.log('[Seed] Seeding database...');
  await connectDatabase();

  // Create or update Admin account
  const adminPassword = await hashPassword('Admin@123456');
  await User.findOneAndUpdate(
    { email: 'admin@bstorm.edu' },
    {
      name: 'System Administrator',
      email: 'admin@bstorm.edu',
      password: adminPassword,
      role: ROLES.ADMIN,
      college: 'BSTORM Academy Operations',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      rollNumber: 'ADM-001',
      grantName: 'Administrator Access',
      avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1U9TCa559VGVPXEorXaOd4-4F3-_yxTRkDiN4yL_rHscfc61Dv4oR6rF-Q5Q4SMHc2OiVKW4ppUavOEPI0k5rbfijrF1pDp1QYAUDcOnaN9BVLxBtRq47v7eMcqWE7eGAv5AK-_2-vhabqlwssRcL7ZzhHYRFQg21fjuWJbAUwIiCuxxGKHOITP3QvhqfDi6cdJfeH5tDbP6RoKeD5zNznQitsO7Rh6xF-n0IR0V8a4IS3RYSu34w6dLQQ',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('[Seed] Verified Administrator account: admin@bstorm.edu / Admin@123456');

  // Then run JSON migration to ensure all course data is in MongoDB
  await migrateJsonToMongo();

  console.log('[Seed] Database seeding completed successfully.');
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
