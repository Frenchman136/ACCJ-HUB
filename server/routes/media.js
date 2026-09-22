import { Router } from 'express';
import multer from 'multer';
import Media from '../models/Media.js';
import Category from '../models/Category.js';
import { requireAuth, requireRole, optionalAuth, isAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { uploadToCloudinary, deleteFromCloudinary, autoThumbnail } from '../config/cloudinary.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  likes: { likesCount: -1 },
  comments: { commentsCount: -1 },
  views: { views: -1 },
};

// GET /api/media — list with filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type, category, search, sort = 'newest', limit = 60, page = 1 } = req.query;
    const match = {};
    if (type) match.type = type;
    if (category) match.category = category;
    if (search) match.title = { $regex: search, $options: 'i' };

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      { $addFields: {
        categoryName: { $first: '$categoryDoc.name' },
        likesCount: { $size: '$likes' },
        commentsCount: { $size: { $ifNull: ['$comments', []] } },
      } },
      { $lookup: { from: 'comments', localField: '_id', foreignField: 'media', as: 'comments' } },
      { $addFields: { commentsCount: { $size: '$comments' } } },
      { $project: { comments: 0, categoryDoc: 0, likes: 0 } },
      { $sort: SORTS[sort] || SORTS.newest },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];
    const items = await Media.aggregate(pipeline);
    res.json(items);
  })
);

// GET /api/media/liked — media the signed-in user liked
router.get(
  '/liked',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await Media.find({ likes: req.userId })
      .populate('category', 'name')
      .sort('-createdAt');
    res.json(items);
  })
);

// GET /api/media/:id — detail (+ view count, + myLike flag)
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category', 'name coverImage');
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json({ ...media.toObject(), myLike: req.userId ? media.likes.includes(req.userId) : false });
  })
);

// POST /api/media — admin upload (multipart: file + optional thumbnail)
router.post(
  '/',
  requireRole('admin', 'super_admin'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const { type, title, description = '', categoryId, newCategory, downloadable } = req.body;
    if (!req.files?.file) return res.status(400).json({ error: 'Media file is required' });
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    let category = categoryId;
    if (newCategory?.trim()) {
      category = await Category.findOneAndUpdate(
        { name: newCategory.trim(), type },
        { $setOnInsert: { name: newCategory.trim(), type } },
        { upsert: true, new: true }
      ).then((c) => c._id);
    }
    if (!category) return res.status(400).json({ error: 'Pick or create a category' });

    const file = req.files.file[0];
    const isMusic = type === 'music';
    const uploaded = await uploadToCloudinary(file.buffer, {
      folder: `accj-hub/${isMusic ? 'music' : 'videos'}`,
      resourceType: 'video', // Cloudinary stores audio & video under 'video'
    });

    let thumbnailUrl = '';
    let thumbnailPublicId = '';
    if (req.files?.thumbnail?.[0]) {
      const t = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
        folder: 'accj-hub/thumbnails',
        resourceType: 'image',
      });
      thumbnailUrl = t.secure_url;
      thumbnailPublicId = t.public_id;
    } else if (!isMusic) {
      thumbnailUrl = autoThumbnail(uploaded.public_id);
    }

    const media = await Media.create({
      type,
      title: title.trim(),
      description,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      thumbnailUrl,
      thumbnailPublicId,
      category,
      uploadedBy: req.userId,
      duration: uploaded.duration || 0,
      downloadable: downloadable === 'true' || downloadable === true,
    });
    res.status(201).json(media);
  })
);

// PATCH /api/media/:id — admin edit
router.patch(
  '/:id',
  requireRole('admin', 'super_admin'),
  upload.single('thumbnail'),
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const { title, description, categoryId, downloadable, newCategory } = req.body;
    if (title !== undefined) media.title = title;
    if (description !== undefined) media.description = description;
    if (newCategory?.trim()) {
      media.category = await Category.findOneAndUpdate(
        { name: newCategory.trim(), type: media.type },
        { $setOnInsert: { name: newCategory.trim(), type: media.type } },
        { upsert: true, new: true }
      ).then((c) => c._id);
    } else if (categoryId) media.category = categoryId;
    if (downloadable !== undefined) media.downloadable = downloadable === 'true' || downloadable === true;

    if (req.file) {
      await deleteFromCloudinary(media.thumbnailPublicId, 'image');
      const t = await uploadToCloudinary(req.file.buffer, {
        folder: 'accj-hub/thumbnails',
        resourceType: 'image',
      });
      media.thumbnailUrl = t.secure_url;
      media.thumbnailPublicId = t.public_id;
    }
    await media.save();
    res.json(media);
  })
);

// DELETE /api/media/:id — admin delete
router.delete(
  '/:id',
  requireRole('admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    await deleteFromCloudinary(media.publicId, 'video');
    await deleteFromCloudinary(media.thumbnailPublicId, 'image');
    await media.deleteOne();
    res.json({ ok: true });
  })
);

// POST /api/media/:id/like — toggle like (optimistic-friendly)
router.post(
  '/:id/like',
  requireAuth,
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    const idx = media.likes.indexOf(req.userId);
    let liked;
    if (idx === -1) {
      media.likes.push(req.userId);
      liked = true;
    } else {
      media.likes.splice(idx, 1);
      liked = false;
    }
    await media.save();
    res.json({ liked, likesCount: media.likes.length });
  })
);

export default router;
