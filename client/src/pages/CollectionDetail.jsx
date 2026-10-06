import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Heart,
  LockKeyhole,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Shuffle,
} from "lucide-react";
import { useApi } from "../lib/api.js";
import { usePlayer } from "../context/PlayerContext.jsx";

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
  const location = useLocation();
  const { pathname, state } = location;
  const navigate = useNavigate();
  const { request } = useApi();
  const { playQueue } = usePlayer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [visibleSongCount, setVisibleSongCount] = useState(30);
  const loadMoreRef = useRef(null);

  const isArtist = pathname.includes("/artist/");
  const isPlaylist = pathname.includes("/playlist/");
  const type = pathname.startsWith("/videos/") ? "videos" : "music";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 220);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;

    if (state?.collection) {
      setData(state.collection);
      setLoading(false);
      return () => {
        active = false;
      };
    }

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
  }, [slug, isArtist, type, state, request]);

  const songs = useMemo(() => data?.songs || [], [data]);

  useEffect(() => {
    setVisibleSongCount(30);
  }, [data]);

  useEffect(() => {
    if (visibleSongCount >= songs.length || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleSongCount((count) => Math.min(songs.length, count + 30));
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [songs.length, visibleSongCount]);

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
  const subtitle =
    data.description || (isArtist ? `${songs.length} tracks` : data.artist);
  const isVideo = type === "videos";

  const handlePlayAll = () => {
    if (isVideo) {
      const first = songs[0];
      if (first) navigate(`/videos/${first._id}`);
      return;
    }
    playQueue(songs, 0);
  };

  const handleShuffle = () => {
    if (isVideo) return handlePlayAll();
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playQueue(shuffled, 0);
  };

  const handlePlayTrack = (index) => {
    if (isVideo) {
      const target = songs[index];
      if (target) navigate(`/videos/${target._id}`);
      return;
    }
    const playableSongs = songs.map((song, songIndex) => ({
      ...song,
      _id: song._id || `collection-${slug}-${songIndex}`,
      thumbnailUrl: song.thumbnailUrl || song.artistAvatar || heroImage,
      url: song.url || "/demo/music-demo-1.mp3",
      categoryName: song.categoryName || "Music",
    }));
    playQueue(playableSongs, index);
    navigate("/music", {
      state: { openPlayer: true, queue: playableSongs, index },
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808] pb-36 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-[#45403c] via-[#191716]/75 to-transparent"
        style={{
          backgroundImage: `linear-gradient(180deg, ${data.tint || "rgba(92, 74, 59, .64)"}, rgba(18, 16, 15, .78) 62%, transparent)`,
        }}
      />
      <header
        className={`fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 transition-colors ${scrolled ? "border-b border-white/5 bg-[#101010]/95 backdrop-blur-xl" : "bg-transparent"}`}
      >
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="grid h-10 w-10 place-items-center text-white"
        >
          <ArrowLeft size={21} />
        </button>
        <p
          className={`max-w-[65vw] truncate text-sm font-bold text-white transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`}
        >
          {data.name}
        </p>
        <span className="w-10" />
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-16 sm:px-6 md:pt-28">
        <div className="relative">
          <img
            src={heroImage}
            alt={`${data.name} cover`}
            className="aspect-square w-full rounded-2xl border border-white/15 object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3 text-white/80">
            <Music2 size={19} />
          </div>
          <div className="absolute -bottom-7 right-1 flex items-center gap-3">
            <button
              type="button"
              aria-label="Play collection"
              onClick={handlePlayAll}
              className="grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-lg shadow-green-950/35"
            >
              <Play size={23} fill="currentColor" className="ml-0.5" />
            </button>
            <button
              type="button"
              aria-label="Shuffle collection"
              onClick={handleShuffle}
              className="grid h-14 w-14 place-items-center rounded-full bg-[#343434] text-white"
            >
              <Shuffle size={21} />
            </button>
          </div>
        </div>

        <h1 className="mt-11 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          {data.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
          {subtitle || `${songs.length} tracks`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label={
              liked.collection ? "Unlike collection" : "Like collection"
            }
            aria-pressed={Boolean(liked.collection)}
            onClick={() =>
              setLiked((value) => ({ ...value, collection: !value.collection }))
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white"
          >
            <Heart
              size={15}
              fill={liked.collection ? "currentColor" : "none"}
              className={liked.collection ? "text-green-400" : ""}
            />{" "}
            Like
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white"
          >
            {data.premium ? <LockKeyhole size={15} /> : <Download size={15} />}{" "}
            Download
          </button>
          <button
            type="button"
            onClick={() =>
              navigator.share?.({ title: data.name, url: window.location.href })
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white"
          >
            <Send size={15} /> Share
          </button>
        </div>

        <div className="mt-6 space-y-1">
          {songs.slice(0, visibleSongCount).map((song, index) => {
            const featured = Array.isArray(song.featuredArtists)
              ? song.featuredArtists.join(", ")
              : String(song.featuredArtists || "");
            return (
              <div
                key={`${song._id || song.url || song.title}-${index}`}
                className="group flex min-h-[76px] w-full items-center gap-3 py-3 text-left"
              >
                <button
                  type="button"
                  onClick={() => handlePlayTrack(index)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <img
                    src={song.thumbnailUrl || song.artistAvatar || heroImage}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-white/10 object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-baseline gap-1 truncate text-sm font-bold text-white">
                      <span className="truncate">{song.title}</span>
                      {featured && (
                        <span className="shrink-0 truncate text-xs font-semibold text-green-400">
                          feat. {featured}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-white/50">
                      {song.artist || data.artist || "Featured artist"}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={
                    liked[index] ? `Unlike ${song.title}` : `Like ${song.title}`
                  }
                  aria-pressed={Boolean(liked[index])}
                  onClick={() =>
                    setLiked((value) => ({ ...value, [index]: !value[index] }))
                  }
                  className={`grid h-9 w-9 shrink-0 place-items-center ${liked[index] ? "text-green-400" : "text-white/65"}`}
                >
                  <Heart
                    size={18}
                    fill={liked[index] ? "currentColor" : "none"}
                  />
                </button>
                <button
                  type="button"
                  aria-label={`More options for ${song.title}`}
                  className="grid h-9 w-8 shrink-0 place-items-center text-white/50"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            );
          })}
          {visibleSongCount < songs.length && (
            <div ref={loadMoreRef} className="h-8" aria-hidden="true" />
          )}
        </div>
      </main>
    </div>
  );
}
