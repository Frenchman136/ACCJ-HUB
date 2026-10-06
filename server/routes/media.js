import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import Media from "../models/Media.js";
import Category from "../models/Category.js";
import {
  requireAuth,
  requireRole,
  optionalAuth,
  isAdmin,
} from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  autoThumbnail,
} from "../config/cloudinary.js";

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

const demoVideoUrls = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
];

const demoMusicUrls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
];

const demoVideoThumbs = [
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
];

const demoMusicThumbs = [
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
  "https://images.unsplash.com/photo-1504542982118-59308b40fe0c",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
];

const isDbReady = () => mongoose.connection.readyState === 1;

async function fetchDemoFallbackVideos(limit = 8) {
  const urls = [
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/movie.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/movie.mp4",
  ];

  return urls.slice(0, limit).map((url, index) => ({
    _id: `demo-video-${index + 1}`,
    type: "video",
    title: `Demo Video ${index + 1}`,
    description:
      "Fallback sample video for local development before real uploads.",
    url,
    publicId: `demo-video-${index + 1}`,
    thumbnailUrl:
      [
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
      ][index] ||
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    thumbnailPublicId: `demo-video-thumb-${index + 1}`,
    category: null,
    uploadedBy: "demo-local",
    likes: [],
    views: 0,
    duration: 45 + index,
    downloadable: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    myLike: false,
  }));
}

async function fetchDeezerFallbackMusic(limit = 8) {
  const searches = [
    "gospel worship",
    "church worship",
    "christian praise",
    "worship songs",
    "gospel music",
  ];
  const seen = new Set();
  const items = [];

  for (const query of searches) {
    if (items.length >= limit) break;

    try {
      const response = await fetch(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=8`,
      );
      if (!response.ok) continue;
      const payload = await response.json();
      const tracks = payload.data || [];

      for (const track of tracks) {
        if (!track.preview || !track.album?.cover_medium) continue;
        const key = String(track.id);
        if (seen.has(key)) continue;
        seen.add(key);

        items.push({
          _id: `deezer-${track.id}`,
          type: "music",
          title: `${track.title_short || track.title} — ${track.artist?.name || "Deezer"}`,
          description:
            "Preview track from Deezer for local demo testing before real uploads.",
          url: track.preview,
          publicId: `deezer-${track.id}`,
          thumbnailUrl: track.album.cover_medium || track.album.cover_big,
          thumbnailPublicId: `deezer-thumb-${track.id}`,
          category: null,
          categoryName: "Demo Music",
          uploadedBy: "demo-deezer",
          likes: [],
          views: 1,
          duration: Number(track.duration) || 180,
          downloadable: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          myLike: false,
        });

        if (items.length >= limit) break;
      }
    } catch (error) {
      console.warn("Deezer fallback fetch failed:", error.message);
    }
  }

  if (items.length < limit) {
    const fallbackSongs = demoMusicUrls.map((url, index) => ({
      _id: `demo-music-${index + 1}`,
      type: "music",
      title: `Demo Track ${index + 1}`,
      description:
        "Fallback sample song for local development before real uploads.",
      url,
      publicId: `demo-music-${index + 1}`,
      thumbnailUrl: demoMusicThumbs[index] || demoMusicThumbs[0],
      thumbnailPublicId: `demo-music-thumb-${index + 1}`,
      category: null,
      categoryName: "Demo Music",
      uploadedBy: "demo-local",
      likes: [],
      views: 1 + index,
      duration: 180 + index * 7,
      downloadable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      myLike: false,
    }));

    for (const song of fallbackSongs) {
      if (items.length >= limit) break;
      items.push(song);
    }
  }

  return items.slice(0, limit);
}

// GET /api/media — list with filters
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      type,
      category,
      search,
      sort = "newest",
      limit = 60,
      page = 1,
    } = req.query;
    const totalCount = await Media.countDocuments();

    if (totalCount === 0) {
      if (type === "video") {
        return res.json(await fetchDemoFallbackVideos(Number(limit) || 8));
      }
      if (!type || type === "music") {
        const fallback = await fetchDeezerFallbackMusic(Number(limit) || 8);
        return res.json(fallback);
      }
    }

    const match = {};
    if (type) match.type = type;
    if (category) match.category = category;
    if (search) match.title = { $regex: search, $options: "i" };

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDoc",
        },
      },
      {
        $addFields: {
          categoryName: { $first: "$categoryDoc.name" },
          likesCount: { $size: "$likes" },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "media",
          as: "comments",
        },
      },
      { $addFields: { commentsCount: { $size: "$comments" } } },
      { $project: { comments: 0, categoryDoc: 0, likes: 0 } },
      { $sort: SORTS[sort] || SORTS.newest },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];
    const items = await Media.aggregate(pipeline);
    res.json(items);
  }),
);

// GET /api/media/liked — media the signed-in user liked
router.get(
  "/liked",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await Media.find({ likes: req.userId })
      .populate("category", "name")
      .sort("-createdAt");
    res.json(items);
  }),
);

// GET /api/media/:id — detail (+ view count, + myLike flag)
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      const demoMedia = [
        ...(await fetchDemoFallbackVideos(8)),
        ...(await fetchDeezerFallbackMusic(8)),
      ].find(
        (item) => item._id === req.params.id || item.url === req.params.id,
      );

      if (!demoMedia) return res.status(404).json({ error: "Media not found" });
      return res.json({ ...demoMedia, myLike: false });
    }

    if (!isDbReady()) {
      const fallback = [
        ...(await fetchDemoFallbackVideos(8)),
        ...(await fetchDeezerFallbackMusic(8)),
      ].find(
        (item) => item._id === req.params.id || item.url === req.params.id,
      );
      if (!fallback) {
        return res.status(404).json({ error: "Media not found" });
      }
      return res.json({ ...fallback, myLike: false });
    }

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("category", "name coverImage");
    if (!media) return res.status(404).json({ error: "Media not found" });
    res.json({
      ...media.toObject(),
      myLike: req.userId ? media.likes.includes(req.userId) : false,
    });
  }),
);

// POST /api/media — admin upload (multipart: file + optional thumbnail)
router.post(
  "/",
  requireRole("admin", "super_admin"),
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      type,
      title,
      description = "",
      categoryId,
      newCategory,
      downloadable,
    } = req.body;
    if (!req.files?.file)
      return res.status(400).json({ error: "Media file is required" });
    if (!title?.trim())
      return res.status(400).json({ error: "Title is required" });

    let category = categoryId;
    if (newCategory?.trim()) {
      category = await Category.findOneAndUpdate(
        { name: newCategory.trim(), type },
        { $setOnInsert: { name: newCategory.trim(), type } },
        { upsert: true, new: true },
      ).then((c) => c._id);
    }
    if (!category)
      return res.status(400).json({ error: "Pick or create a category" });

    const file = req.files.file[0];
    const isMusic = type === "music";
    const uploaded = await uploadToCloudinary(file.buffer, {
      folder: `accj-hub/${isMusic ? "music" : "videos"}`,
      resourceType: "video", // Cloudinary stores audio & video under 'video'
    });

    let thumbnailUrl = "";
    let thumbnailPublicId = "";
    if (req.files?.thumbnail?.[0]) {
      const t = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
        folder: "accj-hub/thumbnails",
        resourceType: "image",
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
      downloadable: downloadable === "true" || downloadable === true,
    });
    res.status(201).json(media);
  }),
);

// PATCH /api/media/:id — admin edit
router.patch(
  "/:id",
  requireRole("admin", "super_admin"),
  upload.single("thumbnail"),
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const { title, description, categoryId, downloadable, newCategory } =
      req.body;
    if (title !== undefined) media.title = title;
    if (description !== undefined) media.description = description;
    if (newCategory?.trim()) {
      media.category = await Category.findOneAndUpdate(
        { name: newCategory.trim(), type: media.type },
        { $setOnInsert: { name: newCategory.trim(), type: media.type } },
        { upsert: true, new: true },
      ).then((c) => c._id);
    } else if (categoryId) media.category = categoryId;
    if (downloadable !== undefined)
      media.downloadable = downloadable === "true" || downloadable === true;

    if (req.file) {
      await deleteFromCloudinary(media.thumbnailPublicId, "image");
      const t = await uploadToCloudinary(req.file.buffer, {
        folder: "accj-hub/thumbnails",
        resourceType: "image",
      });
      media.thumbnailUrl = t.secure_url;
      media.thumbnailPublicId = t.public_id;
    }
    await media.save();
    res.json(media);
  }),
);

// DELETE /api/media/:id — admin delete
router.delete(
  "/:id",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });
    await deleteFromCloudinary(media.publicId, "video");
    await deleteFromCloudinary(media.thumbnailPublicId, "image");
    await media.deleteOne();
    res.json({ ok: true });
  }),
);

// POST /api/media/:id/like — toggle like (optimistic-friendly)
router.post(
  "/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });
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
  }),
);

export default router;
