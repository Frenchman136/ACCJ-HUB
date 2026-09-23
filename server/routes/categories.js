import { Router } from "express";
import Category from "../models/Category.js";
import Media from "../models/Media.js";
import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

// GET /api/categories?type=video|music
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.parentId) filter.parentId = req.query.parentId;

    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    const counts = await Media.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [String(c._id), c.count]),
    );

    const trees = categories.map((category) => ({
      ...category.toObject(),
      count: countMap[String(category._id)] || 0,
    }));

    if (req.query.nested === "1") {
      const childrenMap = {};
      for (const category of categories) {
        const parentKey = String(category.parentId || "root");
        if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
        childrenMap[parentKey].push({
          ...category.toObject(),
          count: countMap[String(category._id)] || 0,
        });
      }

      const roots = (childrenMap.root || []).length
        ? childrenMap.root
        : categories.filter((category) => !category.parentId);

      const withChildren = roots.map((root) => ({
        ...root,
        children: childrenMap[String(root._id)] || [],
      }));
      return res.json(withChildren);
    }

    res.json(trees);
  }),
);

// POST /api/categories — admin create
router.post(
  "/",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const {
      name,
      type,
      coverImage = "",
      parentId = null,
      kind = "genre",
    } = req.body;
    if (!name?.trim() || !type)
      return res.status(400).json({ error: "Name and type required" });

    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent || parent.type !== type) {
        return res.status(400).json({ error: "Parent category type mismatch" });
      }
    }

    const maxOrder = await Category.findOne({
      type,
      parentId: parentId || null,
    })
      .sort("-order")
      .lean();
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const category = await Category.create({
      name: name.trim(),
      type,
      coverImage,
      parentId: parentId || null,
      kind,
      slug,
      order: (maxOrder?.order ?? -1) + 1,
    });
    res.status(201).json(category);
  }),
);

// PATCH /api/categories/:id — rename / update cover / reorder
router.patch(
  "/:id",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  }),
);

// POST /api/categories/reorder — { orderedIds: [...] }
router.post(
  "/reorder",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const { orderedIds } = req.body;
    await Promise.all(
      orderedIds.map((id, i) => Category.findByIdAndUpdate(id, { order: i })),
    );
    res.json({ ok: true });
  }),
);

// DELETE /api/categories/:id — refuses if media attached
router.delete(
  "/:id",
  requireRole("admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const inUse = await Media.countDocuments({ category: req.params.id });
    if (inUse > 0)
      return res
        .status(400)
        .json({
          error: `Category has ${inUse} item(s). Move or delete them first.`,
        });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }),
);

export default router;
