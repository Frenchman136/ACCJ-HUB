import { getAuth } from '@clerk/express';

export const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: 'Sign in to continue.' });
  req.userId = auth.userId;
  req.sessionClaims = auth.sessionClaims;
  req.role =
    auth.userId === process.env.SUPER_ADMIN_USER_ID
      ? 'super_admin'
      : auth.sessionClaims?.publicMetadata?.role || 'user';
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: 'Sign in to continue.' });
  let role = auth.sessionClaims?.publicMetadata?.role || 'user';
  // Env-level super admin override - cannot be demoted from UI
  if (auth.userId === process.env.SUPER_ADMIN_USER_ID) role = 'super_admin';
  req.userId = auth.userId;
  req.role = role;
  if (!roles.includes(role)) return res.status(403).json({ error: 'Insufficient permissions.' });
  next();
};

export const optionalAuth = (req, _res, next) => {
  const auth = getAuth(req);
  req.userId = auth.userId || null;
  req.role =
    auth.userId === process.env.SUPER_ADMIN_USER_ID
      ? 'super_admin'
      : auth.sessionClaims?.publicMetadata?.role || 'user';
  next();
};

export const isAdmin = (role) => role === 'admin' || role === 'super_admin';
