import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
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
  console.log('[Seed] Database user verification completed successfully.');
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
