import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Disc3, Music2, Play } from "lucide-react";
import { useApi } from "../lib/api.js";
import { usePlayer } from "../context/PlayerContext.jsx";
import { formatDuration } from "../lib/utils.js";

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const pickArtistName = (item = {}) =>
  String(
    item.artist || item.categoryName || item.album || "Featured Artist",
  ).trim();

const pickAlbumName = (item = {}) =>
  String(item.album || item.categoryName || "Featured Album").trim();

const buildArtistGroups = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const name = pickArtistName(item);
    if (!name) continue;

    if (!map.has(name)) {
      map.set(name, {
        name,
        avatar: item.artistAvatar || item.thumbnailUrl || "",
        songs: [],
      });
    }

    map.get(name).songs.push(item);
  }

  return [...map.values()];
};

const buildAlbumGroups = (items = []) => {
  const map = new Map();

  for (const item of items) {
    const name = pickAlbumName(item);
    if (!name) continue;

    if (!map.has(name)) {
      map.set(name, {
        name,
        cover: item.thumbnailUrl || "",
        artist: item.artist || item.categoryName || "Featured Artist",
        songs: [],
      });
    }

    map.get(name).songs.push(item);
  }

  return [...map.values()];
};

export default function CollectionDetail() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { request } = useApi();
  const { playQueue } = usePlayer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArtist = pathname.includes("/artist/");
  const type = pathname.startsWith("/videos/") ? "videos" : "music";

  useEffect(() => {
    let active = true;

    request("/media", {
      params: { type: type === "music" ? "music" : "video", limit: 200 },
    })
      .then((items) => {
        if (!active) return;
        const groups = isArtist
          ? buildArtistGroups(items)
          : buildAlbumGroups(items);
        const match = groups.find(
          (group) =>
            slugify(group.name) === String(slug || "") ||
            group.name === decodeURIComponent(String(slug || "")),
        );
        setData(match || null);
      })
      .catch(() => setData(null))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug, isArtist, type]);

  const songs = useMemo(() => data?.songs || [], [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
        <div className="h-8 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="h-64 w-full animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-5 h-7 w-1/3 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-slate-300">
          This {isArtist ? "artist" : "album"} was not found.
        </p>
        <button
          onClick={() => navigate(`/${type}`)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
        >
          <ArrowLeft size={15} /> Back to {type}
        </button>
      </div>
    );
  }

  const heroImage = isArtist ? data.avatar : data.cover;
  const subtitle = isArtist ? `${songs.length} tracks` : data.artist;
  const isVideo = type === "videos";

  const handlePlayAll = () => {
    if (isVideo) {
      const first = songs[0];
      if (first) navigate(`/videos/${first._id}`);
      return;
    }
    playQueue(songs, 0);
  };

  const handlePlayTrack = (index) => {
    if (isVideo) {
      const target = songs[index];
      if (target) navigate(`/videos/${target._id}`);
      return;
    }
    playQueue(songs, index);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 md:pb-20">
      <div className="mt-1 flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
        <div className="-mx-4 overflow-hidden border border-white/10 bg-black/20 shadow-[0_20px_45px_rgba(0,0,0,0.35)] md:mx-0 md:max-w-[280px]">
          <img
            src={heroImage}
            alt={data.name}
            className={
              isArtist
                ? "h-52 w-full object-cover sm:h-64 md:h-72 md:w-[280px]"
                : "h-56 w-full object-cover sm:h-72 md:h-[310px] md:w-[280px]"
            }
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#f5d98d]">
              {isArtist ? "Artist" : "Album"}
            </span>
            <span className="text-xs text-slate-400">
              {songs.length} tracks
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {data.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">{subtitle}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4a437] to-[#f59e0b] px-5 py-2.5 text-sm font-semibold text-[#120f0a] shadow-[0_0_30px_rgba(212,164,55,0.25)] transition hover:brightness-110"
            >
              <Play size={16} fill="currentColor" />
              {isVideo ? "Open first video" : "Play all"}
            </button>

            <Link
              to={`/${type}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-[#d4a437]/50 hover:text-white"
            >
              <Music2 size={15} /> Explore more
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-[#f5d98d]">
            <Disc3 size={16} />
            <span className="text-[10px] font-medium uppercase tracking-[0.22em]">
              {isArtist ? "Popular tracks" : "Track list"}
            </span>
          </div>
          <span className="text-xs text-slate-400">{songs.length} songs</span>
        </div>

        <div className="space-y-2">
          {songs.map((song, index) => (
            <button
              key={`${song._id || song.url}-${index}`}
              onClick={() => handlePlayTrack(index)}
              className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition hover:bg-white/[0.01]"
            >
              <div className="w-5 text-sm font-medium text-slate-400">
                {index + 1}
              </div>

              <img
                src={song.thumbnailUrl || song.artistAvatar || heroImage}
                alt={song.title}
                className="h-12 w-12 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {song.title}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {song.artist || "Featured artist"}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="tabular-nums">
                  {formatDuration(song.duration)}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white">
                  <Play size={13} fill="currentColor" className="ml-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isArtist ? (
        <div className="mt-6 border-t border-white/10 pt-5 text-sm text-slate-400">
          <p className="font-medium text-white">Artist profile</p>
          <p className="mt-2">
            {data.name} • {songs.length} songs available
          </p>
        </div>
      ) : (
        <div className="mt-6 border-t border-white/10 pt-5 text-sm text-slate-400">
          <p className="font-medium text-white">About this album</p>
          <p className="mt-2">
            {data.artist} • {songs.length} tracks • {data.name}
          </p>
        </div>
      )}
    </div>
  );
}
