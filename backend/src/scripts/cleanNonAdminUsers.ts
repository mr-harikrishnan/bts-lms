import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { Certificate } from '../models/Certificate.js';

export async function cleanNonAdminUsers() {
  await connectDatabase();

  const admin = await User.findOne({ email: 'admin@gmail.com' });
  console.log('[Clean] Found Admin account:', admin?._id, admin?.email);

  if (!admin) {
    console.error('[Clean] admin@gmail.com not found!');
    await disconnectDatabase();
    return;
  }

  // Delete all users except admin@gmail.com
  const userResult = await User.deleteMany({ email: { $ne: 'admin@gmail.com' } });
  console.log(`[Clean] Deleted ${userResult.deletedCount} non-admin user(s).`);

  // Delete all enrollments not belonging to admin
  const enrResult = await Enrollment.deleteMany({ userId: { $ne: admin._id } });
  console.log(`[Clean] Deleted ${enrResult.deletedCount} orphan enrollment(s).`);

  // Delete all certificates not belonging to admin
  const certResult = await Certificate.deleteMany({ userId: { $ne: admin._id } });
  console.log(`[Clean] Deleted ${certResult.deletedCount} orphan certificate(s).`);

  const remaining = await User.find({}, 'name email role');
  console.log('[Clean] Remaining Users in DB:', JSON.stringify(remaining, null, 2));

  await disconnectDatabase();
}

cleanNonAdminUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Clean] Error:', err);
    process.exit(1);
  });
