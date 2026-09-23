import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["video", "music"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    thumbnailPublicId: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    artist: { type: String, default: "" },
    album: { type: String, default: "" },
    artistAvatar: { type: String, default: "" },
    uploadedBy: { type: String, required: true },
    likes: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    downloadable: { type: Boolean, default: false },
  },
  { timestamps: true },
);

mediaSchema.index({ type: 1, category: 1, createdAt: -1 });

export default mongoose.model("Media", mediaSchema);
