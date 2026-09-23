import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard, Music2, ArrowRight, Flame, Play } from "lucide-react";
import { useApi } from "../lib/api.js";
import MediaCard from "../components/MediaCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

const artistImageMap = {
  "Chacho Majunga": "/artists/Chacho%20Majunga.jpeg",
  Aurah: "/artists/Aura.jpg",
};

const buildArtistRows = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const name = (
      item.artist ||
      item.category?.name ||
      "Featured Artist"
    ).trim();
    if (!name) continue;

    if (!map.has(name)) {
      map.set(name, {
        name,
        avatar:
          item.artistAvatar || item.thumbnailUrl || artistImageMap[name] || "",
        songs: [],
      });
    }

    map.get(name).songs.push(item);
  }

  return [...map.values()];
};

const buildAlbumRows = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const name = (
      item.album ||
      item.title ||
      item.category?.name ||
      "Featured Album"
    ).trim();
    const artist = (
      item.artist ||
      item.category?.name ||
      "Featured Artist"
    ).trim();
    if (!name) continue;

    if (!map.has(name)) {
      map.set(name, {
        name,
        artist,
        cover: item.thumbnailUrl || "",
        songs: [],
      });
    }

    map.get(name).songs.push(item);
  }

  return [...map.values()];
};

export default function Home() {
  const { request } = useApi();
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState(null);
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    request("/media", { params: { type: "video", sort: "likes", limit: 8 } })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    request("/media", { params: { sort: "views", limit: 8 } })
      .then(setTrending)
      .catch(() => setTrending([]));
    request("/media", { params: { limit: 8 } })
      .then(setRecent)
      .catch(() => setRecent([]));
  }, []);

  const allMedia = useMemo(
    () => [...(trending || []), ...(recent || []), ...(featured || [])],
    [trending, recent, featured],
  );
  const preferredArtists = [
    {
      name: "Chacho Majunga",
      avatar: "/artists/Chacho%20Majunga.jpeg",
      songs: [],
    },
    { name: "Aurah", avatar: "/artists/Aura.jpg", songs: [] },
    { name: "Soliste", avatar: "", songs: [] },
    { name: "Frenchman", avatar: "", songs: [] },
    { name: "Mufasa", avatar: "", songs: [] },
  ];
  const artistRows = useMemo(() => {
    const fromMedia = buildArtistRows(allMedia);
    const map = new Map(fromMedia.map((artist) => [artist.name, artist]));
    for (const artist of preferredArtists) {
      if (!map.has(artist.name)) {
        map.set(artist.name, { ...artist, songs: [] });
      }
    }
    return [...map.values()];
  }, [allMedia]);
  const albumRows = useMemo(() => buildAlbumRows(allMedia), [allMedia]);
  const featuredVideo = featured?.[0];

  return (
    <div className="pb-28 md:pb-12">
      {/* HERO */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20"
      >
        <motion.p
          variants={heroItem}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4a437]"
        >
          Apostles Church of Christ Jesus
        </motion.p>
        <motion.h1
          variants={heroItem}
          className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
        >
          <span className="grad-text drop-shadow-[0_0_30px_rgba(212,164,55,0.35)]">
            Sound
          </span>{" "}
          <span className="text-white">Groove</span>
        </motion.h1>
        <motion.p
          variants={heroItem}
          className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg"
        >
          Every sermon, every song, every moment — streamed beautifully. Watch
          videos, listen to music, and join the conversation.
        </motion.p>
        <motion.div variants={heroItem} className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/videos"
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-blue px-6 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
          >
            <Clapperboard size={18} />
            Watch videos
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/music"
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition-all hover:border-accent/50 hover:shadow-glow-sm"
          >
            <Music2 size={18} className="text-accent-soft" />
            Listen to music
          </Link>
        </motion.div>
      </motion.section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionTitle>Top artists</SectionTitle>
          <Link
            to="/music"
            className="text-sm text-accent-soft hover:underline"
          >
            Show all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {artistRows.length === 0 &&
            [...Array(6)].map((_, i) => <SkeletonArtistCard key={i} />)}
          {artistRows.slice(1).map((artist, index) => {
            const isSquare = artist.name === "Chacho Majunga";
            return (
              <Link
                key={`${artist.name}-${index}`}
                to="/music"
                className="group min-w-[150px] flex-shrink-0 text-center"
              >
                <div
                  className={
                    isSquare
                      ? "mx-auto h-36 w-36 overflow-hidden bg-white/5 shadow-card"
                      : "mx-auto h-36 w-36 overflow-hidden rounded-full bg-white/5 shadow-card"
                  }
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className={
                      isSquare
                        ? "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        : artist.name === "Aurah"
                          ? "h-full w-full rounded-full object-cover object-[center_18%] transition duration-500 scale-125 group-hover:scale-[1.35]"
                          : "h-full w-full rounded-full object-cover transition duration-500 group-hover:scale-105"
                    }
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-white">
                  {artist.name}
                </p>
                <p className="text-xs text-slate-400">Artist</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionTitle>Latest albums</SectionTitle>
          <Link
            to="/music"
            className="text-sm text-accent-soft hover:underline"
          >
            Show all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {albumRows.length === 0 &&
            [...Array(6)].map((_, i) => <SkeletonAlbumCard key={i} />)}
          {albumRows.map((album, index) => (
            <Link
              key={`${album.name}-${index}`}
              to="/music"
              className="group min-w-[200px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-accent/40"
            >
              <div className="relative">
                <img
                  src={album.cover}
                  alt={album.name}
                  className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#f5d98d]">
                  Album
                </div>
              </div>
              <div className="p-3.5">
                <p className="text-sm font-bold text-white">{album.name}</p>
                <p className="mt-1 text-xs text-slate-400">{album.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      {featuredVideo && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <SectionTitle>Featured this week</SectionTitle>
          <div className="mt-5 flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((item, i) => (
              <div key={item._id} className="w-[78vw] shrink-0 sm:w-[420px]">
                <MediaCard item={item} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
      {featured === null && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <SectionTitle>Featured this week</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      )}

      {/* TRENDING */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionTitle icon={<Flame size={18} className="text-orange-400" />}>
          Trending now
        </SectionTitle>
        <div className="mt-5">
          {trending === null &&
            [...Array(1)].map((_, i) => <SkeletonCard key={i} />)}
          {trending?.slice(0, 1).map((item, i) => (
            <div key={item._id} className="w-full">
              <MediaCard item={item} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* RECENTLY ADDED */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionTitle>Recently added</SectionTitle>
        <div className="mt-5">
          {recent === null &&
            [...Array(1)].map((_, i) => <SkeletonCard key={i} />)}
          {recent?.slice(0, 1).map((item, i) => (
            <div key={item._id} className="w-full">
              <MediaCard item={item} index={i} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white sm:text-2xl">
      {icon}
      {children}
      <span className="ml-1 h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
    </h2>
  );
}

function SkeletonArtistCard() {
  return (
    <div className="min-w-[150px] flex-shrink-0 text-center">
      <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-white/5" />
      <div className="mt-3 h-3 w-20 animate-pulse rounded-full bg-white/5 mx-auto" />
      <div className="mt-2 h-2.5 w-14 animate-pulse rounded-full bg-white/5 mx-auto" />
    </div>
  );
}

function SkeletonAlbumCard() {
  return (
    <div className="min-w-[200px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-44 w-full animate-pulse bg-white/5" />
      <div className="space-y-2 p-3.5">
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/5" />
        <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
}
