import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  CalendarDays,
  Tag,
  Play,
  Music2,
  Download,
  Share2,
  Check,
} from "lucide-react";
import { useApi, errMsg } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import LikeButton from "../components/LikeButton.jsx";
import CommentSection from "../components/CommentSection.jsx";
import MediaCard from "../components/MediaCard.jsx";
import { timeAgo } from "../lib/utils.js";

export default function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const toast = useToast();
  const player = usePlayer();

  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [related, setRelated] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMedia(null);
    setError(null);
    request(`/media/${id}`)
      .then(async (m) => {
        setMedia(m);
        // build next/prev queue from the same category
        const siblings = await request("/media", {
          params: {
            type: m.type,
            category: m.category?._id,
            sort: "newest",
            limit: 50,
          },
        });

        const idx = siblings.findIndex((s) => s._id === m._id);
        const safeQueue =
          idx >= 0 ? siblings : [m, ...siblings.filter((s) => s._id !== m._id)];
        const safeIndex = idx >= 0 ? idx : 0;

        setQueue(safeQueue);
        setQueueIndex(safeIndex);
        setRelated(safeQueue.filter((s) => s._id !== m._id).slice(0, 4));
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error)
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-lg text-rose-400">{error}</p>
        <Link to="/" className="mt-4 inline-block text-accent-soft underline">
          Back home
        </Link>
      </div>
    );

  if (!media)
    return (
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        <div className="skeleton aspect-video w-full rounded-2xl" />
        <div className="skeleton mt-6 h-7 w-2/3 rounded-md" />
        <div className="skeleton mt-3 h-4 w-1/3 rounded-md" />
      </div>
    );

  const isMusic = media.type === "music";

  const playMusic = () => {
    player.playQueue(queue, queueIndex);
    toast.success(`Playing "${media.title}"`);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const goTo = (offset) => {
    const target = queue[queueIndex + offset];
    if (target) navigate(`/${isMusic ? "music" : "videos"}/${target._id}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-8 sm:px-6 md:pb-16">
      {/* PLAYER AREA */}
      {isMusic ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 shadow-card"
        >
          <div className="flex flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:px-10">
            <motion.img
              src={media.thumbnailUrl}
              alt=""
              animate={{
                rotate:
                  player.playing && player.current?._id === media._id ? 360 : 0,
              }}
              transition={{
                duration: 8,
                repeat:
                  player.playing && player.current?._id === media._id
                    ? Infinity
                    : 0,
                ease: "linear",
              }}
              className="h-44 w-44 rounded-full border-4 border-accent/40 object-cover shadow-glow"
            />
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-soft">
                <Music2 size={12} /> {media.category?.name || "Music"}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                {media.title}
              </h1>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                {media.description ||
                  "Press play — the track keeps playing while you browse."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playMusic}
                className="mt-5 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-blue px-6 py-3 font-semibold text-white shadow-glow"
              >
                <Play size={18} fill="currentColor" />
                {player.current?._id === media._id && player.playing
                  ? "Playing now"
                  : "Play"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <VideoPlayer
            media={media}
            hasPrev={queueIndex > 0}
            hasNext={queueIndex >= 0 && queueIndex < queue.length - 1}
            onPrev={() => goTo(-1)}
            onNext={() => goTo(1)}
          />
        </motion.div>
      )}

      {/* META ROW */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Eye size={15} /> {media.views.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} /> {timeAgo(media.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag size={15} />
            <Link
              to={`/${isMusic ? "music" : "videos"}?cat=${media.category?._id}`}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-accent-soft transition-colors hover:bg-accent/20"
            >
              {media.category?.name}
            </Link>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {media.downloadable && (
            <a
              href={media.url}
              download
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-white"
            >
              <Download size={15} /> Download
            </a>
          )}
          <button
            onClick={share}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-white"
          >
            {copied ? (
              <Check size={15} className="text-emerald-400" />
            ) : (
              <Share2 size={15} />
            )}
            Share
          </button>
          <LikeButton
            mediaId={media._id}
            initialLiked={media.myLike}
            initialCount={media.likes.length}
            size="lg"
          />
        </div>
      </div>

      {media.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-300"
        >
          {media.description}
        </motion.p>
      )}

      <CommentSection mediaId={media._id} />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-white">
            More in this category
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, i) => (
              <MediaCard key={item._id} item={item} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
