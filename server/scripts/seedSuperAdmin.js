/**
 * Promote a user to super_admin.
 * Usage: node scripts/seedSuperAdmin.js user_email@example.com
 *   or set SUPER_ADMIN_USER_ID in .env (recommended - permanent protection).
 */
import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';

const email = process.argv[2];
if (!email && !process.env.SUPER_ADMIN_USER_ID) {
  console.error('Usage: node scripts/seedSuperAdmin.js <email>');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

try {
  let userId = process.env.SUPER_ADMIN_USER_ID;
  if (email) {
    const { data } = await clerk.users.getUserList({ emailAddress: [email] });
    if (!data.length) throw new Error(`No Clerk user found with email ${email}`);
    userId = data[0].id;
  }
  await clerk.users.updateUserMetadata(userId, { publicMetadata: { role: 'super_admin' } });
  console.log(`Done. User ${userId} is now super_admin.`);
  console.log('Tip: set SUPER_ADMIN_USER_ID=' + userId + ' in server/.env to lock this in.');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
}
