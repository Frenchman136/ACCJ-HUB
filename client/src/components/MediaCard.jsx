import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Music2, Heart, MessageCircle, Eye } from "lucide-react";

/** Glass card with blur-up thumbnail, subtle 3D tilt, stagger entrance. */
export default function MediaCard({ item, index = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const isMusic = item.type === "music";

  if (isMusic) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: Math.min(index * 0.05, 0.5),
          type: "spring",
          stiffness: 120,
          damping: 18,
        }}
        whileHover={{ y: -4 }}
      >
        <Link
          to={`/music/${item._id}`}
          className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-card backdrop-blur-xl transition-colors hover:border-accent/40"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-800">
            {!loaded && <div className="skeleton absolute inset-0" />}
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
              }`}
            />
            <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink-950/60 via-transparent to-transparent">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d4a437]/90 shadow-glow-sm backdrop-blur-sm">
                <Music2 className="text-white" size={14} />
              </span>
            </span>
          </div>

          <div className="min-w-0 flex-1 py-1">
            <h3 className="line-clamp-2 font-display text-[15px] font-semibold text-white transition-colors group-hover:text-accent-soft">
              {item.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Heart size={11} /> {item.likesCount ?? item.likes?.length ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={11} /> {item.commentsCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> {item.views ?? 0}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.05, 0.5),
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      whileHover={{ y: -6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Link
        to={`/videos/${item._id}`}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-card backdrop-blur-xl transition-colors hover:border-accent/40"
      >
        <div className="relative aspect-video overflow-hidden bg-ink-800">
          {!loaded && <div className="skeleton absolute inset-0" />}
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
              loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
          />
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.span
              initial={false}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="grid h-16 w-16 place-items-center rounded-full bg-[#d4a437]/95 shadow-[0_0_30px_rgba(212,164,55,0.45)] backdrop-blur-sm"
              whileHover={{ scale: 1.12 }}
            >
              <Play className="ml-1 text-white" size={26} fill="currentColor" />
            </motion.span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-display text-[15px] font-semibold text-white transition-colors group-hover:text-accent-soft">
            {item.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Heart size={12} /> {item.likesCount ?? item.likes?.length ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {item.commentsCount ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {item.views ?? 0}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
