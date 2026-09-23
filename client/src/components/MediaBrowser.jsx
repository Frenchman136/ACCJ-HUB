import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Play,
  SkipBack,
  SkipForward,
  Music2,
  Disc3,
} from "lucide-react";
import { useApi } from "../lib/api.js";
import { usePlayer } from "../context/PlayerContext.jsx";
import { formatDuration } from "../lib/utils.js";
import MediaCard from "./MediaCard.jsx";
import CategoryPills from "./CategoryPills.jsx";
import SkeletonCard from "./SkeletonCard.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "likes", label: "Most liked" },
  { value: "comments", label: "Most commented" },
  { value: "views", label: "Most viewed" },
];

/** Shared, filterable media grid used by both Videos and Music pages. */
export default function MediaBrowser({ type }) {
  const { request } = useApi();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("newest");
  const [albumIndex, setAlbumIndex] = useState(0);
  const [artistIndex, setArtistIndex] = useState(0);
  const [view, setView] = useState("albums");
  const activeCat = searchParams.get("cat") || "";

  useEffect(() => {
    request(`/categories?type=${type}`)
      .then(setCategories)
      .catch(() => {});
  }, [type]);

  useEffect(() => {
    const t = setTimeout(
      async () => {
        try {
          const data = await request("/media", {
            params: {
              type,
              category: activeCat || undefined,
              search: search || undefined,
              sort,
            },
          });
          setItems(data);
        } catch {
          setItems([]);
        }
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(t);
  }, [type, activeCat, search, sort]);

  useEffect(() => {
    setAlbumIndex(0);
    setArtistIndex(0);
    setView("albums");
  }, [type, activeCat, search]);

  const setCat = (cat) =>
    setSearchParams((p) => {
      const next = new URLSearchParams(p);
      cat ? next.set("cat", cat) : next.delete("cat");
      return next;
    });

  const musicAlbums = useMemo(() => {
    if (!items?.length) return [];
    const byAlbum = new Map();
    for (const item of items) {
      const album = (
        item.album ||
        item.categoryName ||
        "Featured Album"
      ).trim();
      const artist = (
        item.artist ||
        item.categoryName ||
        "Featured Artist"
      ).trim();
      if (!byAlbum.has(album)) {
        byAlbum.set(album, {
          name: album,
          cover: item.thumbnailUrl || "",
          songs: [],
          artist,
        });
      }
      byAlbum.get(album).songs.push({
        ...item,
        categoryName:
          item.categoryName || (type === "music" ? "Deezer" : "Video"),
        thumbnailUrl: item.thumbnailUrl || item.artistAvatar || "",
      });
    }
    return [...byAlbum.values()];
  }, [type, items]);

  const musicArtists = useMemo(() => {
    if (!items?.length) return [];
    const byArtist = new Map();
    for (const item of items) {
      const artist = (
        item.artist ||
        item.categoryName ||
        "Featured Artist"
      ).trim();
      const album = (
        item.album ||
        item.categoryName ||
        "Featured Album"
      ).trim();
      if (!byArtist.has(artist)) {
        byArtist.set(artist, {
          name: artist,
          avatar: item.artistAvatar || item.thumbnailUrl || "",
          songs: [],
          album,
        });
      }
      byArtist.get(artist).songs.push({
        ...item,
        categoryName:
          item.categoryName || (type === "music" ? "Deezer" : "Video"),
        thumbnailUrl: item.thumbnailUrl || item.artistAvatar || "",
      });
    }
    return [...byArtist.values()];
  }, [type, items]);

  const slugify = (value = "") =>
    String(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const openCollection = (kind, name) => {
    const base = `/${type}`;
    const slug = slugify(name);
    navigate(`${base}/${kind}/${slug}`);
  };

  const title = type === "music" ? "Music" : "Videos";
  const heading = useMemo(() => title, [title]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 md:pb-12">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold sm:text-4xl"
      >
        <span className="grad-text">{heading}</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-2 text-sm text-slate-400"
      >
        {type === "music"
          ? "Browse curated Deezer-inspired albums and artists, then open a playlist and keep the music moving."
          : "Services, events, and moments — stream them all in one place."}
      </motion.p>

      {items && (
        <>
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d4a437]">
                Browse
              </p>
              <h2 className="font-display text-2xl font-bold text-white">
                Albums
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {musicAlbums.map((album, index) => (
                <button
                  key={`${album.name}-${index}`}
                  onClick={() => openCollection("album", album.name)}
                  className="group min-w-[220px] flex-shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left transition-all hover:border-accent/40 hover:bg-white/[0.05]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={album.cover}
                      alt={album.name}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-white">
                      <span className="rounded-full bg-black/40 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f5d98d]">
                        Album
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] backdrop-blur-sm">
                        {album.songs.length} tracks
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-base font-semibold text-white">
                      {album.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {album.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d4a437]">
                Featured
              </p>
              <h2 className="font-display text-2xl font-bold text-white">
                Artists
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {musicArtists.map((artist, index) => (
                <button
                  key={`${artist.name}-${index}`}
                  onClick={() => openCollection("artist", artist.name)}
                  className="group min-w-[180px] flex-shrink-0 flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-accent/40 hover:bg-accent/[0.04]"
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="h-24 w-24 rounded-full border border-white/10 object-cover shadow-glow-sm"
                  />
                  <p className="mt-3 text-center text-sm font-semibold text-white">
                    {artist.name}
                  </p>
                  <p className="mt-1 text-center text-xs text-slate-400">
                    {artist.songs.length} tracks
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!items && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
