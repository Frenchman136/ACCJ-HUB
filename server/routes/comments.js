import { Router } from 'express';
import Comment from '../models/Comment.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// GET /api/media/:id/comments
router.get(
  '/media/:id/comments',
  asyncHandler(async (req, res) => {
    const comments = await Comment.find({ media: req.params.id }).sort('-createdAt');
    res.json(comments);
  })
);

// POST /api/media/:id/comments
router.post(
  '/media/:id/comments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    const { userId } = req;
    const claims = req.sessionClaims || {};
    const name =
      [claims.firstName, claims.lastName].filter(Boolean).join(' ') ||
      claims.username ||
      'ACCJ Member';
    const imageUrl = claims.imageUrl || '';
    const comment = await Comment.create({
      media: req.params.id,
      userId,
      userName: name,
      userAvatar: imageUrl || '',
      text: text.trim(),
    });
    res.status(201).json(comment);
  })
);

// PATCH /api/comments/:id — edit own
router.patch(
  '/comments/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.userId)
      return res.status(403).json({ error: 'You can only edit your own comments' });
    comment.text = req.body.text?.trim() || comment.text;
    comment.edited = true;
    await comment.save();
    res.json(comment);
  })
);

// DELETE /api/comments/:id — own or admin
router.delete(
  '/comments/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const isAdminUser = req.role === 'admin' || req.role === 'super_admin';
    if (comment.userId !== req.userId && !isAdminUser)
      return res.status(403).json({ error: 'Not allowed' });
    await comment.deleteOne();
    res.json({ ok: true });
  })
);

// GET /api/me/comments — current user's comment history
router.get(
  '/me/comments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const comments = await Comment.find({ userId: req.userId })
      .populate('media', 'title type thumbnailUrl')
      .sort('-createdAt');
    res.json(comments);
  })
);

export default router;
