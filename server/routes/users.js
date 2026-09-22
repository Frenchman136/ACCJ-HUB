import { Router } from 'express';
import { createClerkClient } from '@clerk/backend';
import { requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const withRole = (u) => ({
  id: u.id,
  name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Member',
  email: u.emailAddresses?.[0]?.emailAddress || '',
  avatar: u.imageUrl || '',
  role:
    u.id === process.env.SUPER_ADMIN_USER_ID
      ? 'super_admin'
      : u.publicMetadata?.role || 'user',
  createdAt: u.createdAt,
});

// GET /api/users — admin: list users
router.get(
  '/',
  requireRole('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const { data } = await clerk.users.getUserList({ limit: 100, orderBy: '-created_at' });
    res.json(data.map(withRole));
  })
);

// POST /api/users/:id/promote — super admin only
router.post(
  '/:id/promote',
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    if (req.params.id === process.env.SUPER_ADMIN_USER_ID)
      return res.status(400).json({ error: 'Already the super admin' });
    const user = await clerk.users.updateUserMetadata(req.params.id, {
      publicMetadata: { role: 'admin' },
    });
    res.json(withRole(user));
  })
);

// POST /api/users/:id/demote — super admin only
router.post(
  '/:id/demote',
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    if (req.params.id === process.env.SUPER_ADMIN_USER_ID)
      return res.status(400).json({ error: 'The super admin cannot be demoted' });
    const user = await clerk.users.updateUserMetadata(req.params.id, {
      publicMetadata: { role: 'user' },
    });
    res.json(withRole(user));
  })
);

export default router;
