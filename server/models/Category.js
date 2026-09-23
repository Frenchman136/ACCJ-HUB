import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["video", "music"], required: true },
    coverImage: { type: String, default: "" },
    order: { type: Number, default: 0 },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    kind: {
      type: String,
      enum: ["genre", "artist", "album", "collection"],
      default: "genre",
    },
    slug: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1, type: 1, parentId: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
