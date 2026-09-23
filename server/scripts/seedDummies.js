import "dotenv/config";
import mongoose from "mongoose";
import Media from "../models/Media.js";
import Category from "../models/Category.js";

const VIDEO_URLS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
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
};

const MUSIC_ARTISTS = [
  "Worship Collective",
  "David McKenzie",
  "Grace Revival",
  "Mighty Praise",
  "Lighthouse Choir",
  "The Bethel Sound",
  "Covenant Voices",
  "Eden Praise Band",
  "Hope Assembly",
  "Mercy & Light",
];

const ALBUM_COVERS = [
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
  "https://images.unsplash.com/photo-1504542982118-59308b40fe0c",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
  "https://images.unsplash.com/photo-1525201548942-d8732f6617a0",
];

function buildMusicCatalog() {
  const tracks = [];

  MUSIC_ARTISTS.forEach((artist, artistIndex) => {
    const albumName = `${artist} Live Sessions`;
    const artistAvatar = `https://images.unsplash.com/photo-${["1500648767791-00dcc994a43e", "1494790108377-be9c29b29330", "1544005313-94ddf0286df2", "1506794778202-cad84cf45f1d", "1544723795-3fb6469f5b39", "1504593811423-6dd665756598", "1500648767791-00dcc994a43e", "1487412720507-e7ab37603c6f", "1524504388940-b1c1722653e1", "1541534401786-2077eed87a74"][artistIndex]}?auto=format&fit=crop&w=400&q=80`;

    for (let songNumber = 1; songNumber <= 10; songNumber += 1) {
      tracks.push({
        type: "music",
        title: `${artist} — Track ${songNumber}`,
        description: `${albumName} • worship and praise set ${songNumber}.`,
        url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${((artistIndex * 10 + songNumber) % 16) + 1}.mp3`,
        publicId: `deezer-${artistIndex + 1}-${songNumber}`,
        thumbnailUrl: ALBUM_COVERS[artistIndex],
        artistAvatar,
        artist,
        album: albumName,
        duration: 185 + songNumber * 6,
        uploadedBy,
        likes: [],
        views: 0,
        downloadable: false,
      });
    }
  });

  return tracks;
}

async function ensureCategory(type, name, parentId = null, kind = "genre") {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return Category.findOneAndUpdate(
    { name, type, parentId: parentId || null },
    {
      $setOnInsert: {
        name,
        type,
        parentId: parentId || null,
        kind,
        slug,
        order: 0,
      },
    },
    { upsert: true, new: true },
  );
}

async function createDummyMedia(type, docs, category) {
  if (type === "music") {
    await Media.deleteMany({
      type: "music",
      $or: [
        { title: /^Demo Music/i },
        { description: /Local dummy music/i },
        { uploadedBy: process.env.SUPER_ADMIN_USER_ID || "local-test-user" },
      ],
    });
  } else {
    await Media.deleteMany({ uploadedBy, type });
  }

  const records = docs.map((doc, index) => ({
    type,
    title: doc.title || `${category.name} ${index + 1}`,
    description:
      doc.description || `Demo ${type} item ${index + 1} for testing.`,
    url: doc.url,
    publicId: doc.publicId || `${type}-demo-${index + 1}`,
    thumbnailUrl: doc.thumbnailUrl || thumbnailSeeds[type]?.[index],
    thumbnailPublicId: doc.thumbnailPublicId || `${type}-thumb-${index + 1}`,
    category: category._id,
    artist: doc.artist || "",
    album: doc.album || "",
    artistAvatar: doc.artistAvatar || doc.thumbnailUrl || "",
    uploadedBy,
    likes: [],
    views: 0,
    duration: doc.duration || (type === "video" ? 45 + index : 120 + index * 7),
    downloadable: false,
  }));

  await Media.insertMany(records);
  console.log(
    `Inserted ${records.length} ${type} dummy items under category "${category.name}".`,
  );
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const videoCategory = await ensureCategory("video", "Demo Videos");
  const videoDocs = VIDEO_URLS.map((url, index) => ({
    url,
    title: `Demo Video ${index + 1}`,
    description: `Local dummy video item ${index + 1} for testing.`,
    publicId: `video-demo-${index + 1}`,
    thumbnailUrl: thumbnailSeeds.video[index],
    thumbnailPublicId: `video-thumb-${index + 1}`,
    duration: 45 + index,
  }));

  await createDummyMedia("video", videoDocs, videoCategory);

  const musicRoot = await ensureCategory("music", "Deezer Library");
  const artistsRoot = await ensureCategory(
    "music",
    "Artists",
    musicRoot._id,
    "collection",
  );
  const albumsRoot = await ensureCategory(
    "music",
    "Albums",
    musicRoot._id,
    "collection",
  );

  const musicDocs = buildMusicCatalog();
  await Media.deleteMany({ type: "music" });

  const records = [];
  for (const item of musicDocs) {
    const artistCategory = await ensureCategory(
      "music",
      item.artist,
      artistsRoot._id,
      "artist",
    );
    await ensureCategory("music", item.album, albumsRoot._id, "album");

    records.push({
      type: "music",
      title: item.title,
      description: item.description,
      url: item.url,
      publicId: item.publicId,
      thumbnailUrl: item.thumbnailUrl,
      thumbnailPublicId: `${item.publicId}-thumb`,
      category: artistCategory._id,
      artist: item.artist,
      album: item.album,
      artistAvatar: item.artistAvatar,
      uploadedBy,
      likes: [],
      views: 0,
      duration: item.duration,
      downloadable: false,
    });
  }

  await Media.insertMany(records);
  console.log(
    `Inserted ${records.length} music tracks across ${MUSIC_ARTISTS.length} artists and ${MUSIC_ARTISTS.length} albums.`,
  );

  console.log("Dummy media seeding complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Dummy seed failed:", err.message);
  process.exit(1);
});
