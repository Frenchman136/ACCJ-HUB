import "dotenv/config";
import mongoose from "mongoose";
import Media from "../models/Media.js";
import Category from "../models/Category.js";

const VIDEO_URLS = [
  "/demo/video-demo-1.mp4",
  "/demo/video-demo-2.mp4",
  "/demo/video-demo-1.mp4",
  "/demo/video-demo-2.mp4",
  "/demo/video-demo-1.mp4",
  "/demo/video-demo-2.mp4",
  "/demo/video-demo-1.mp4",
  "/demo/video-demo-2.mp4",
  "/demo/video-demo-1.mp4",
  "/demo/video-demo-2.mp4",
];

const MUSIC_URLS = [
  "/demo/music-demo-1.mp3",
  "/demo/music-demo-2.mp3",
  "/demo/music-demo-1.mp3",
  "/demo/music-demo-2.mp3",
  "/demo/music-demo-1.mp3",
  "/demo/music-demo-2.mp3",
  "/demo/music-demo-1.mp3",
  "/demo/music-demo-2.mp3",
  "/demo/music-demo-1.mp3",
  "/demo/music-demo-2.mp3",
];

const uploadedBy = process.env.SUPER_ADMIN_USER_ID || "local-test-user";

const thumbnailSeeds = {
  video: [
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
  ],
  music: [
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
  ],
};

async function ensureCategory(type, name) {
  return Category.findOneAndUpdate(
    { name, type },
    { $setOnInsert: { name, type, order: 0 } },
    { upsert: true, new: true },
  );
}

async function createDummyMedia(type, urls, titlePrefix) {
  const categoryName = type === "video" ? "Demo Videos" : "Demo Music";
  const category = await ensureCategory(type, categoryName);

  await Media.deleteMany({ uploadedBy, type });

  const docs = urls.map((url, index) => ({
    type,
    title: `${titlePrefix} ${index + 1}`,
    description: `Local dummy ${type} item ${index + 1} for testing.`,
    url,
    publicId: `${type}-demo-${index + 1}`,
    thumbnailUrl: thumbnailSeeds[type][index],
    thumbnailPublicId: `${type}-thumb-${index + 1}`,
    category: category._id,
    uploadedBy,
    likes: [],
    views: 0,
    duration: type === "video" ? 45 + index : 120 + index * 7,
    downloadable: false,
  }));

  await Media.insertMany(docs);
  console.log(
    `Inserted ${docs.length} ${type} dummy items under category "${categoryName}".`,
  );
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await createDummyMedia("video", VIDEO_URLS, "Demo Video");
  await createDummyMedia("music", MUSIC_URLS, "Demo Music");

  console.log("Dummy media seeding complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Dummy seed failed:", err.message);
  process.exit(1);
});
