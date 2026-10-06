import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Flame,
  Heart,
  ListMusic,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  Settings,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Upload,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext.jsx";

const tracks = [
  {
    _id: "1",
    title: "Golden Hour",
    artist: "Sora & The Echoes",
    album: "Afterglow",
    thumbnailUrl: "/artists/Aura.jpg",
    url: "/demo/music-demo-1.mp3",
    explicit: false,
  },
  {
    _id: "2",
    title: "Midnight Drive",
    artist: "Northline",
    album: "Neon Days",
    thumbnailUrl: "/artists/Chacho%20Majunga.jpeg",
    url: "/demo/music-demo-2.mp3",
    explicit: true,
  },
  {
    _id: "3",
    title: "Still Here",
    artist: "Mira Sol",
    album: "Soft Ground",
    thumbnailUrl: "/artists/Aura.jpg",
    url: "/demo/music-demo-1.mp3",
    explicit: false,
  },
  {
    _id: "4",
    title: "Slow Motion",
    artist: "The Green Room",
    album: "Blue Hour",
    thumbnailUrl: "/artists/Chacho%20Majunga.jpeg",
    url: "/demo/music-demo-2.mp3",
    explicit: false,
  },
];

const listRows = [
  {
    title: "After the Rain",
    artist: "Mira Sol",
    album: "Soft Ground",
    thumbnail: "/artists/Aura.jpg",
    explicit: false,
  },
  {
    title: "City Lights",
    artist: "Northline",
    album: "Neon Days",
    thumbnail: "/artists/Chacho%20Majunga.jpeg",
    explicit: true,
  },
  {
    title: "One More Night",
    artist: "Sora & The Echoes",
    album: "Afterglow",
    thumbnail: "/artists/Aura.jpg",
    explicit: false,
  },
  {
    title: "Open Road",
    artist: "The Green Room",
    album: "Blue Hour",
    thumbnail: "/artists/Chacho%20Majunga.jpeg",
    explicit: false,
  },
];

const playlistCards = [
  {
    title: "Late Night Drive",
    description: "24 tracks · 1 hr 42 min",
    image: "/artists/Aura.jpg",
    shadow: "rotate-[-3deg]",
  },
  {
    title: "Golden Hour",
    description: "18 tracks · 1 hr 08 min",
    image: "/artists/Chacho%20Majunga.jpeg",
    shadow: "rotate-[3deg]",
  },
  {
    title: "Sunday Sessions",
    description: "31 tracks · 2 hr 14 min",
    image: "/artists/Aura.jpg",
    shadow: "rotate-[-2deg]",
  },
  {
    title: "Blue Skies",
    description: "16 tracks · 54 min",
    image: "/artists/Chacho%20Majunga.jpeg",
    shadow: "rotate-[2deg]",
  },
];

const artistMixes = [
  {
    artist: "Sora & The Echoes",
    image: "/artists/Aura.jpg",
    tone: "from-emerald-900/70",
  },
  {
    artist: "Northline",
    image: "/artists/Chacho%20Majunga.jpeg",
    tone: "from-slate-700/70",
  },
  {
    artist: "Mira Sol",
    image: "/artists/Aura.jpg",
    tone: "from-teal-900/70",
  },
  {
    artist: "The Green Room",
    image: "/artists/Chacho%20Majunga.jpeg",
    tone: "from-zinc-700/70",
  },
];

const albumCards = [
  {
    artist: "Sora & The Echoes",
    album: "Afterglow",
    image: "/artists/Aura.jpg",
  },
  {
    artist: "Northline",
    album: "Neon Days",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
  { artist: "Mira Sol", album: "Soft Ground", image: "/artists/Aura.jpg" },
  {
    artist: "The Green Room",
    album: "Blue Hour",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
];

const featureCards = [
  {
    title: "Afterglow",
    blurb: "A warm, cinematic soundscape",
    image: "/artists/Aura.jpg",
  },
  {
    title: "Neon Days",
    blurb: "Electric nights, new stories",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
  {
    title: "Blue Hour",
    blurb: "Slow songs for late evenings",
    image: "/artists/Aura.jpg",
  },
];

const commentRows = [
  {
    name: "Maya James",
    text: "This is exactly the kind of song I needed for the drive home.",
    date: "2 min ago",
    likes: 48,
  },
  {
    name: "Eli Stone",
    text: "The bridge is unreal. The whole album is beautifully paced.",
    date: "1 hr ago",
    likes: 29,
    reply: "3 replies",
  },
];

const sectionLabel =
  "text-[10px] font-bold uppercase tracking-[0.25em] text-white/40";
function SongRow({ item, index, onPlay, compact = false }) {
  const player = usePlayer();
  const isPlaying = player.current?._id === item._id && player.playing;

  return (
    <button
      type="button"
      onClick={() => onPlay(item, index)}
      className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-white/[0.045] sm:px-3"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5">
        <img
          src={item.thumbnailUrl || item.thumbnail}
          alt=""
          className="h-full w-full object-cover"
        />
        {isPlaying && (
          <span className="absolute inset-0 grid place-items-center bg-black/35 text-green-400">
            <span className="flex h-5 items-end gap-[2px]">
              {[0, 1, 2].map((bar) => (
                <span
                  key={bar}
                  className="w-[2px] rounded bg-green-400"
                  style={{
                    height: `${12 + bar * 4}px`,
                    animation: `eq 0.7s ease-in-out ${bar * 0.15}s infinite`,
                  }}
                />
              ))}
            </span>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-white">{item.title}</p>
          {item.explicit && (
            <span className="rounded bg-green-500/15 px-1 py-0.5 text-[8px] font-black text-green-300">
              E
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-white/40">
          {item.artist || item.artistName}
        </p>
      </div>
      {!compact && (
        <span className="hidden text-[11px] text-white/30 sm:block">
          {item.album}
        </span>
      )}
      <Heart
        size={16}
        className="shrink-0 text-white/25 transition group-hover:text-green-400"
      />
      <MoreHorizontal size={17} className="shrink-0 text-white/25" />
    </button>
  );
}

function SectionHeader({ title, action = "chevron", badge }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-base font-extrabold tracking-tight text-white sm:text-lg">
          {title}
        </h2>
        {badge && (
          <span className="ml-2 rounded-full bg-green-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-green-300">
            {badge}
          </span>
        )}
      </div>
      {action === "chevron" ? (
        <button
          type="button"
          aria-label={`View ${title}`}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/35 transition hover:border-green-400/50 hover:text-green-400"
        >
          <ChevronRight size={16} />
        </button>
      ) : (
        action && <div>{action}</div>
      )}
    </div>
  );
}

function TinyAvatar({ src, name, ring = false, greenRing = false }) {
  return (
    <div
      className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 ${ring ? (greenRing ? "ring-2 ring-green-400" : "ring-2 ring-green-400") : ""}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <UserRound size={18} className="text-white/45" />
      )}
      <span
        className={`absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full ${greenRing ? "bg-green-500" : "bg-green-500"} text-[#111]`}
      >
        <Check size={9} strokeWidth={3} />
      </span>
    </div>
  );
}

export default function MusicShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const player = usePlayer();
  const [activeCard, setActiveCard] = useState(0);
  const [fullPlayer, setFullPlayer] = useState(false);
  const [playlistDetail, setPlaylistDetail] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [effectsOn, setEffectsOn] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [seekDragging, setSeekDragging] = useState(false);

  useEffect(() => {
    if (!location.state?.openPlayer) return;
    if (Array.isArray(location.state.queue) && location.state.queue.length) {
      player.playQueue(location.state.queue, location.state.index || 0);
    }
    setFullPlayer(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, player.playQueue]);

  const normalizedTracks = useMemo(
    () =>
      tracks.map((track, index) => ({
        ...track,
        thumbnailUrl: track.thumbnailUrl,
        artist: track.artist,
        categoryName: "Music",
        index,
      })),
    [],
  );

  const playTrack = async (item, index) => {
    const queue = normalizedTracks.map((track) => ({
      ...track,
      url: track.url || "/demo/music-demo-1.mp3",
    }));
    const matchingIndex = queue.findIndex(
      (track) => track._id === item._id || track.title === item.title,
    );
    const queueIndex = matchingIndex >= 0 ? matchingIndex : index;
    if (!item._id && queue[queueIndex]) {
      queue[queueIndex] = {
        ...queue[queueIndex],
        ...item,
        _id: queue[queueIndex]._id,
        thumbnailUrl:
          item.thumbnailUrl || item.thumbnail || queue[queueIndex].thumbnailUrl,
      };
    }
    player.playQueue(queue, queueIndex);
    setFullPlayer(true);
  };

  const playArtistMix = (artist) => {
    const mixQueue = normalizedTracks
      .map((track) => ({
        ...track,
        url: track.url || "/demo/music-demo-1.mp3",
      }))
      .sort((first, second) => {
        if (first.artist === artist) return -1;
        if (second.artist === artist) return 1;
        return first.index - second.index;
      });
    if (mixQueue.length) {
      player.playQueue(mixQueue, 0);
      setFullPlayer(true);
    }
  };

  const openMusicCollection = (item, kind = "album") => {
    const collectionName = kind === "playlist" ? item.title : item.album;
    const matchingTracks = normalizedTracks.filter(
      (track) => track.album === collectionName || track.artist === item.artist,
    );
    const fallbackTracks = matchingTracks.length
      ? matchingTracks
      : normalizedTracks;
    navigate(`/music/${kind}/${encodeURIComponent(collectionName)}`, {
      state: {
        collection: {
          name: collectionName,
          description:
            kind === "playlist" ? item.description : `${item.artist} · Album`,
          artist: item.artist || "Sound Groove",
          cover: item.image || item.thumbnailUrl || "/artists/Aura.jpg",
          tint:
            item.artist === "Northline"
              ? "rgba(68, 79, 93, .66)"
              : item.artist === "Mira Sol"
                ? "rgba(92, 67, 75, .66)"
                : item.artist === "The Green Room"
                  ? "rgba(57, 82, 64, .66)"
                  : "rgba(94, 74, 58, .66)",
          songs: fallbackTracks,
          kind,
        },
      },
    });
  };

  const playAlbumInShell = (album) => {
    const albumTrackIndex = normalizedTracks.findIndex(
      (track) => track.album === album.album,
    );
    const artistTrackIndex = normalizedTracks.findIndex(
      (track) => track.artist === album.artist,
    );
    const trackIndex =
      albumTrackIndex >= 0 ? albumTrackIndex : artistTrackIndex;
    if (trackIndex >= 0) playTrack(normalizedTracks[trackIndex], trackIndex);
  };

  const openFullPlayer = () => {
    setFullPlayer(true);
    setQueueOpen(false);
    setPlaylistDetail(false);
  };

  const currentTrack = player.current || tracks[0];
  const coverArt =
    currentTrack.thumbnailUrl || currentTrack.thumbnail || "/artists/Aura.jpg";
  const artistName = currentTrack.artist || currentTrack.artistName || "Artist";
  const albumName = currentTrack.album || currentTrack.albumName || "Singles";
  const playerTint =
    artistName === "Northline"
      ? "rgba(67, 82, 94, .48)"
      : artistName === "Mira Sol"
        ? "rgba(88, 70, 76, .46)"
        : artistName === "The Green Room"
          ? "rgba(62, 85, 68, .46)"
          : "rgba(93, 73, 57, .42)";
  const formatTime = (seconds) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
  };
  const seekFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width),
    );
    if (player.duration) player.seek(ratio * player.duration);
  };
  const seekFromDrag = (event) => {
    if (seekDragging) seekFromPointer(event);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white selection:bg-green-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(34,197,94,0.13),transparent_34%),radial-gradient(circle_at_90%_30%,rgba(34,197,94,0.05),transparent_25%)]" />

      <header className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-white/[0.07] bg-[#090909]/85 px-4 backdrop-blur-2xl sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_24px_rgba(34,197,94,0.3)]">
            <Music2 size={17} className="text-[#161000]" />
          </span>
          <span className="font-display text-sm font-black tracking-tight">
            Sound <span className="text-green-400">Groove</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-2 text-[10px] font-bold text-green-300 transition hover:bg-green-500 hover:text-[#111]"
          >
            Get premium +
          </button>
          <button
            type="button"
            aria-label="Upload"
            className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Upload size={17} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Bell size={17} />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      <main className="relative z-10 pb-36 pt-[68px] md:pt-[124px]">
        <div className="px-4 pb-8 pt-5 sm:px-6">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {[
              "All",
              "Hip hop",
              "Indie",
              "R&B",
              "Ethiopiques",
              "Afrobeat",
              "Soul",
            ].map((genre, index) => (
              <button
                key={genre}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${index === 0 ? "border-green-500 bg-green-500 text-[#111]" : "border-white/10 bg-white/[0.025] text-white/50 hover:border-green-400/40 hover:text-white"}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Made for you" />
          <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#111] p-3 shadow-2xl">
            <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="order-2 rounded-[1.25rem] bg-gradient-to-br from-green-500 to-green-600 p-5 text-[#151000] sm:order-1 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em]">
                  Your listening mix
                </p>
                <h2 className="mt-3 font-display text-2xl font-black leading-tight">
                  The sound of your evening.
                </h2>
                <p className="mt-2 text-sm font-medium text-black/60">
                  Fresh tracks selected around your taste.
                </p>
                <button
                  type="button"
                  onClick={() => playTrack(tracks[0], 0)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111] px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Play size={14} fill="currentColor" /> Play mix
                </button>
              </div>
              <div className="order-1 relative min-h-[210px] overflow-hidden rounded-[1.25rem] bg-black sm:order-2">
                <img
                  src="/artists/Aura.jpg"
                  alt="Featured artist"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs font-bold text-white">
                    Sora & The Echoes
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">
                    New mix · 42 tracks
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveCard(index)}
                aria-label={`Show card ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${activeCard === index ? "w-8 bg-green-400" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Continue listening" />
          <div className="grid gap-3">
            {listRows.slice(0, 1).map((item, index) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#111] p-3"
              >
                <div className="flex gap-3">
                  <div className="relative w-[42%] shrink-0 overflow-hidden rounded-2xl">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {item.artist} · {item.album}
                    </p>
                    <div className="mt-4 h-1 rounded-full bg-white/10">
                      <div className="h-full w-[58%] rounded-full bg-green-500" />
                    </div>
                    <p className="mt-2 text-[10px] text-white/30">
                      3:42 of 6:00
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Playlists" />
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {playlistCards.map((card, index) => (
              <button
                key={card.title}
                type="button"
                onClick={() => openMusicCollection(card, "playlist")}
                className="group relative w-[68%] min-w-[68%] snap-start overflow-hidden rounded-[1.5rem] bg-[#151515] text-left shadow-2xl sm:w-[48%] sm:min-w-[48%]"
                style={{ transform: `translateY(${index % 2 ? 8 : 0}px)` }}
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ transform: `translateY(-10px) scale(.98)` }}
                >
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-green-500 text-[#111] shadow-xl">
                    <Play size={16} fill="currentColor" />
                  </span>
                </div>
                <div className="relative z-10 -mt-1 p-4">
                  <h3 className="text-sm font-extrabold">{card.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/40">
                    {card.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Featured for you" />
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {featureCards.map((item) => (
              <article
                key={item.title}
                className="group relative h-[290px] w-full min-w-[88%] snap-start overflow-hidden rounded-[1.6rem] bg-[#171717] sm:min-w-[76%]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-300">
                    Featured
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-white/50">{item.blurb}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Albums" />
          <div className="grid grid-cols-2 gap-3">
            {albumCards.map((item) => (
              <button
                key={item.album}
                type="button"
                onClick={() => openMusicCollection(item)}
                className="group text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-[#161616] shadow-[0_12px_30px_rgba(0,0,0,.4)]">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute -right-1 -top-1 h-8 w-8 rounded-bl-2xl bg-green-500 shadow-lg" />
                </div>
                <p className="mt-3 text-center text-xs font-bold text-white">
                  {item.artist}
                </p>
                <p className="mt-0.5 text-center text-[11px] text-white/35">
                  {item.album}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <div className="mb-4 flex items-center justify-between px-0">
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              Made for you
            </h2>
            <ChevronRight size={20} className="text-white/35" />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 px-1">
            {artistMixes.map((mix) => (
              <button
                key={mix.artist}
                type="button"
                aria-label={`Play ${mix.artist} radio mix`}
                onClick={() => playArtistMix(mix.artist)}
                className="group min-w-0 text-left"
              >
                <span
                  aria-hidden="true"
                  className="relative mx-auto mb-1 flex h-2 w-[78%] flex-col items-center justify-center gap-[2px]"
                >
                  <span className="h-[2px] w-[72%] rounded-full bg-white/10" />
                  <span className="h-[2px] w-full rounded-full bg-white/15" />
                </span>
                <span
                  className={`relative block aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b ${mix.tone} via-[#272a29] to-[#090909]`}
                >
                  <Radio
                    size={17}
                    aria-hidden="true"
                    className="absolute left-3 top-3 z-10 text-white/90"
                  />
                  <span className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/60" />
                  <img
                    src={mix.image}
                    alt=""
                    className="absolute left-1/2 top-[56%] aspect-square w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-xl transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="mt-2 block truncate text-sm font-bold text-white">
                  {mix.artist}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader title="Artists to follow" />
          <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {["Sora", "Northline", "Mira Sol", "Green Room"].map(
              (name, index) => (
                <div
                  key={name}
                  className="w-28 shrink-0 snap-start text-center"
                >
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                    <img
                      src={
                        index % 2
                          ? "/artists/Chacho%20Majunga.jpeg"
                          : "/artists/Aura.jpg"
                      }
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-[#090909] bg-green-500 text-[#111]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  </div>
                  <p className="mt-3 truncate text-xs font-bold">{name}</p>
                  <p className="mt-1 text-[10px] text-white/35">
                    {index + 1}.2M followers
                  </p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full border border-green-400/40 px-3 py-1.5 text-[10px] font-bold text-green-300 transition hover:bg-green-500 hover:text-[#111]"
                  >
                    Follow
                  </button>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <SectionHeader
            title="Premium tracks"
            action={
              <button
                type="button"
                className="rounded-full bg-green-500 px-3 py-1.5 text-[10px] font-black text-[#111]"
              >
                Get premium +
              </button>
            }
          />
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {listRows.map((item, index) => (
              <div
                key={`${item.title}-premium`}
                className="w-[78%] min-w-[78%] snap-start rounded-[1.4rem] border border-white/10 bg-[#111] p-3 sm:w-[48%] sm:min-w-[48%]"
              >
                <SongRow
                  item={{ ...item, thumbnailUrl: item.thumbnail }}
                  index={index}
                  onPlay={playTrack}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {fullPlayer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            className="fixed inset-0 z-[90] overflow-y-auto bg-black"
            style={{
              backgroundImage: `linear-gradient(180deg, ${playerTint} 0%, #000 48%)`,
            }}
          >
            <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#080808]/90 px-4 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setFullPlayer(false)}
                aria-label="Close player"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60"
              >
                <ChevronDown size={18} />
              </button>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/45">
                  from the album
                </p>
                <p className="max-w-[55vw] truncate text-sm font-bold">
                  {albumName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Queue"
                onClick={() => setQueueOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60"
              >
                <ListMusic size={17} />
              </button>
            </div>
            <div className="mx-auto max-w-2xl px-5 pb-28 pt-3">
              <motion.img
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={coverArt}
                alt={`${albumName} cover art`}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <div className="mt-6 text-center">
                <p className="text-base font-medium text-white/60">
                  {artistName}
                </p>
                <h1 className="mt-1 flex items-center justify-center gap-2 font-display text-2xl font-black tracking-tight">
                  {currentTrack.title}
                  {currentTrack.explicit && (
                    <span className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-black text-white/70">
                      E
                    </span>
                  )}
                </h1>
                <span className="mt-2 inline-flex rounded bg-green-500/15 px-2 py-0.5 text-[9px] font-black text-green-300">
                  EXPLICIT
                </span>
              </div>
              <div className="no-scrollbar mt-6 -mr-5 flex gap-2 overflow-x-auto pb-1 pl-0">
                {["Like", "Add to playlist", "Download", "Share"].map(
                  (label, index) => (
                    <button
                      key={label}
                      type="button"
                      className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[11px] font-semibold text-white/80 transition hover:border-green-400/60 hover:text-green-300"
                    >
                      {index === 0 ? (
                        <Heart size={14} />
                      ) : index === 1 ? (
                        <Plus size={14} />
                      ) : index === 2 ? (
                        <Download size={14} />
                      ) : (
                        <Share2 size={14} />
                      )}
                      {label}
                    </button>
                  ),
                )}
              </div>
              <div className="mt-6">
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Seek through track"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(player.duration)}
                  aria-valuenow={Math.round(player.progress)}
                  onClick={seekFromPointer}
                  onPointerDown={(event) => {
                    setSeekDragging(true);
                    event.currentTarget.setPointerCapture(event.pointerId);
                    seekFromPointer(event);
                  }}
                  onPointerMove={seekFromDrag}
                  onPointerUp={() => setSeekDragging(false)}
                  onPointerCancel={() => setSeekDragging(false)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight")
                      player.seek(
                        Math.min(player.duration, player.progress + 5),
                      );
                    if (event.key === "ArrowLeft")
                      player.seek(Math.max(0, player.progress - 5));
                  }}
                  className="flex h-14 cursor-pointer items-center gap-[2px] outline-none"
                >
                  {[...Array(72)].map((_, index) => (
                    <span
                      key={index}
                      className={`w-full rounded-full ${index / 72 <= (player.duration ? player.progress / player.duration : 0) ? "bg-green-400" : "bg-white/20"}`}
                      style={{ height: `${18 + ((index * 17) % 67)}%` }}
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-white/75">
                  <span>{formatTime(player.progress)}</span>
                  <span>{formatTime(player.duration)}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="More options"
                  className="grid h-10 w-10 place-items-center rounded-full text-white/40"
                >
                  <MoreHorizontal size={19} />
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={player.prev}
                    className="grid h-10 w-10 place-items-center rounded-full text-white/80"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Play or pause"
                    onClick={player.toggle}
                    className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/90 bg-transparent text-white"
                  >
                    {player.playing ? (
                      <Pause size={24} fill="currentColor" />
                    ) : (
                      <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={player.next}
                    className="grid h-10 w-10 place-items-center rounded-full text-white/80"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Shuffle"
                  onClick={player.toggleShuffle}
                  aria-pressed={player.shuffle}
                  className={`grid h-10 w-10 place-items-center rounded-full ${player.shuffle ? "text-green-400" : "text-white/55"}`}
                >
                  <Shuffle size={18} />
                </button>
              </div>

              <div className="mt-10 border-t border-white/10 pt-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">Effects</h2>
                  <button
                    type="button"
                    aria-pressed={effectsOn}
                    onClick={() => setEffectsOn(!effectsOn)}
                    className="flex items-center gap-2 text-[10px] font-bold text-white/55"
                  >
                    <span>Effects</span>
                    <span
                      className={`relative h-5 w-9 rounded-full transition ${effectsOn ? "bg-green-500" : "bg-white/20"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${effectsOn ? "right-0.5" : "left-0.5"}`}
                      />
                    </span>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["Glow", "Echo", "Depth"].map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setEffectsOn(true)}
                      className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#262626] to-[#0e0e0e]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,197,94,.45),transparent_50%)]" />
                      <p className="absolute inset-x-0 bottom-3 text-center text-[10px] font-bold">
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">Lyrics preview</h2>
                  <ChevronRight size={16} className="text-white/40" />
                </div>
                <button
                  type="button"
                  onClick={() => setLyricsOpen(true)}
                  className="relative mt-3 flex w-full items-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#282321,#101010_65%)] p-4 text-left"
                >
                  <p className="flex-1 text-lg font-black leading-7 text-white">
                    Golden hour, golden road,
                    <br />I still hear the sound of your voice,
                    <br />
                    we keep driving through the night,
                    <br />
                    and the city lights begin to...
                  </p>
                  <ChevronRight
                    size={18}
                    className="ml-2 shrink-0 text-white/40"
                  />
                </button>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">Uploaded by</h2>
                  <ChevronRight size={16} className="text-green-400" />
                </div>
                <div className="mt-4 flex items-center gap-3 py-2">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/10">
                    <img
                      src={coverArt}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {artistName}{" "}
                      <span className="ml-1 inline-grid h-3.5 w-3.5 place-items-center rounded-full bg-green-500 align-middle text-black">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-bold text-green-400">1.8M</span>{" "}
                      <span className="text-white/80">Followers</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-green-400/70 px-4 py-2 text-[11px] font-bold text-white"
                  >
                    Follow
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Indie", "Original", "New release", "2026"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/[0.08] px-3 py-2 text-[10px] font-bold uppercase text-white/65"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div
                  className={`relative mt-4 overflow-hidden text-xs ${expanded ? "" : "max-h-[92px]"}`}
                >
                  <div className="space-y-2">
                    <p>
                      <strong>Release date:</strong>{" "}
                      <span className="text-white/65">Jun 24, 2026</span>
                    </p>
                    <p>
                      <strong>Album:</strong>{" "}
                      <button
                        type="button"
                        className="font-medium text-green-400"
                      >
                        {albumName}
                      </button>
                    </p>
                    <p>
                      <strong>Producer:</strong>{" "}
                      <span className="text-white/65">{artistName}</span>
                    </p>
                    <p>
                      <strong>Genre:</strong>{" "}
                      <span className="text-white/65">Indie pop</span>
                    </p>
                    <p>
                      <strong>Written by:</strong>{" "}
                      <span className="text-white/65">{artistName}</span>
                    </p>
                  </div>
                  {!expanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="relative z-[1] mx-auto -mt-5 flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-[11px] font-bold text-white"
                >
                  <ArrowDown size={13} className="text-green-400" />
                  {expanded ? "Show less" : "Read more"}
                </button>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">More from artist</h2>
                  <ChevronRight size={16} className="text-green-400" />
                </div>
                <div className="no-scrollbar mt-4 -mr-5 flex snap-x gap-4 overflow-x-auto pb-2">
                  {albumCards.map((item) => (
                    <div
                      key={item.album}
                      className="group w-[42%] shrink-0 snap-start text-center"
                    >
                      <div className="relative">
                        <div className="absolute -right-1 -top-2 z-10 h-2 w-7 rounded-t-sm bg-white/20" />
                        <img
                          src={item.image}
                          alt=""
                          className="aspect-square w-full rounded-xl object-cover"
                        />
                        <span className="absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-1 text-[8px] font-black text-white">
                          NEW
                        </span>
                      </div>
                      <p className="mt-2 truncate text-xs font-bold">
                        {item.artist}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-white/40">
                        {item.album}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">
                    Playlists featuring artist
                  </h2>
                  <ChevronRight size={16} className="text-white/40" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 px-1">
                  {playlistCards.slice(0, 4).map((playlist) => (
                    <button
                      key={playlist.title}
                      type="button"
                      className="min-w-0 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className="mx-auto mb-1 flex h-2 w-[78%] flex-col items-center justify-center gap-[2px]"
                      >
                        <span className="h-[2px] w-[72%] rounded-full bg-white/10" />
                        <span className="h-[2px] w-full rounded-full bg-white/15" />
                      </span>
                      <span className="relative block aspect-square overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={playlist.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-green-300">
                          <ListMusic size={13} />
                        </span>
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-7">
                          <span className="block truncate text-xs font-bold text-white">
                            {playlist.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[9px] text-white/60">
                            Featuring {artistName}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">Top supporters</h2>
                  <ChevronRight size={16} className="text-green-400" />
                </div>
                <div className="no-scrollbar mt-4 flex items-center gap-3 overflow-x-auto">
                  <TinyAvatar
                    src="/artists/Aura.jpg"
                    name="Maya"
                    ring
                    greenRing
                  />
                  <TinyAvatar src="/artists/Chacho%20Majunga.jpeg" name="Eli" />
                  <TinyAvatar src="/artists/Aura.jpg" name="Noah" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white/40">
                    +18
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-green-400/70 py-3 text-[11px] font-bold text-white"
                >
                  <Plus size={15} className="text-green-400" />
                  Support this project
                </button>
              </div>

              <div className="mt-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black">2 comments</h2>
                  <MessageCircle size={16} className="text-white/40" />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#111] p-2">
                  <TinyAvatar src="/artists/Aura.jpg" name="You" />
                  <input
                    aria-label="Comment"
                    placeholder="Add a comment..."
                    className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-full bg-green-500 text-black"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {commentRows.map((comment) => (
                  <div key={comment.name} className="mt-5 flex gap-3">
                    <TinyAvatar
                      src={
                        comment.name === "Maya James"
                          ? "/artists/Aura.jpg"
                          : "/artists/Chacho%20Majunga.jpeg"
                      }
                      name={comment.name}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-white/[0.035] p-3">
                        <p className="text-xs font-bold">{comment.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/60">
                          {comment.text}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[9px] text-white/30">
                        <span>{comment.likes} likes</span>
                        <span>👍</span>
                        <span>👎</span>
                        <span>{comment.reply || ""}</span>
                        <span className="text-green-400">Reply</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playlistDetail && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed inset-0 z-[95] overflow-y-auto bg-[#090909]"
          >
            <div className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 backdrop-blur-xl">
              <button
                onClick={() => setPlaylistDetail(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10"
              >
                <ArrowLeft size={18} />
              </button>
              <p className="text-sm font-black">Playlist</p>
              <button className="text-white/40">
                <MoreHorizontal size={19} />
              </button>
            </div>
            <div className="px-5 pb-28 pt-3">
              <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[1.7rem] bg-[#111]">
                <img
                  src="/artists/Aura.jpg"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <h1 className="font-display text-3xl font-black">
                    Golden Hour
                  </h1>
                  <p className="mt-2 text-xs text-white/40">
                    24 tracks · 1 hr 42 min
                  </p>
                </div>
                <button className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-[#111]">
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
              <div className="mt-5 flex gap-2">
                {["Like", "Download", "Share"].map((label) => (
                  <button
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[11px] font-semibold text-white/60"
                  >
                    <Heart size={14} />
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-8 space-y-1">
                {listRows.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => playTrack(tracks[index], index)}
                    className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/[0.04]"
                  >
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.title}</p>
                      <p className="mt-0.5 truncate text-[10px] text-white/35">
                        {item.artist}
                      </p>
                    </div>
                    <Heart size={15} className="text-white/25" />
                    <MoreHorizontal size={16} className="text-white/25" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lyricsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[110] overflow-y-auto bg-[linear-gradient(160deg,#26201c,#090909_45%)] px-5 pb-28 pt-4"
          >
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <button
                type="button"
                aria-label="Close lyrics"
                onClick={() => setLyricsOpen(false)}
                className="grid h-10 w-10 place-items-center text-white/75"
              >
                <ChevronDown size={24} />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold">{currentTrack.title}</p>
                <p className="text-xs text-white/45">{artistName}</p>
              </div>
              <span className="w-10" />
            </div>
            <div className="mx-auto mt-16 max-w-2xl space-y-5 font-display text-2xl font-black leading-tight text-white sm:text-3xl">
              <p>Golden hour, golden road,</p>
              <p>I still hear the sound of your voice,</p>
              <p>We keep driving through the night,</p>
              <p>And the city lights begin to fade.</p>
              <p className="text-white/40">Somewhere past the quiet,</p>
              <p className="text-white/40">We find a place to start again.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {queueOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#080808]"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <button
                onClick={() => setQueueOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-sm font-black">Queue</h2>
              <MoreHorizontal size={18} className="text-white/40" />
            </div>
            <div className="px-4 pb-28">
              {normalizedTracks.map((item, index) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => playTrack(item, index)}
                  className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {index === player.index && (
                      <span className="absolute inset-0 grid place-items-center bg-black/40 text-green-400">
                        <Volume2 size={17} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-white/35">
                      {item.artist}
                    </p>
                  </div>
                  <MoreHorizontal size={17} className="text-white/25" />
                  <span className="text-white/20">⋮⋮</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="fixed bottom-24 left-4 right-4 rounded-full bg-green-500 py-3.5 text-sm font-black text-[#111] shadow-xl"
            >
              Clear queue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
