import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { ROLES } from '../constants/roles.js';
import { logger } from '../utils/logger.js';

export const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

/**
 * Ensures a default system administrator account exists on startup.
 * If not present, creates it with bcrypt-hashed credentials.
 * If present, guarantees role is set to ADMIN.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const existing = await User.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });

    if (!existing) {
      const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      await User.create({
        name: 'System Administrator',
        email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: ROLES.ADMIN,
        college: 'DLABS Central Administration',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        rollNumber: 'ADM-001',
        grantName: 'Executive Administrator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      });
      logger.info(`[AdminInit] Created default administrator: ${DEFAULT_ADMIN_EMAIL}`);
    } else {
      let modified = false;
      if (existing.role !== ROLES.ADMIN) {
        existing.role = ROLES.ADMIN;
        modified = true;
      }
      if (modified) {
        await existing.save();
        logger.info(`[AdminInit] Verified administrator privileges for: ${DEFAULT_ADMIN_EMAIL}`);
      }
    }
  } catch (error) {
    logger.error('[AdminInit] Error ensuring default admin account:', error);
  }
}
