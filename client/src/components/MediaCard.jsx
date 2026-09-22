import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Music2, Heart, MessageCircle, Eye } from 'lucide-react';

/** Glass card with blur-up thumbnail, subtle 3D tilt, stagger entrance. */
export default function MediaCard({ item, index = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const isMusic = item.type === 'music';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), type: 'spring', stiffness: 120, damping: 18 }}
      whileHover={{ y: -6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Link
        to={`/${item.type === 'music' ? 'music' : 'videos'}/${item._id}`}
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
              loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
            }`}
          />
          {/* play overlay */}
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <motion.span
              initial={false}
              className="grid h-14 w-14 place-items-center rounded-full bg-accent/90 shadow-glow backdrop-blur"
              whileHover={{ scale: 1.12 }}
            >
              {isMusic ? <Music2 className="text-white" size={22} /> : <Play className="ml-1 text-white" size={22} fill="currentColor" />}
            </motion.span>
          </div>
          {/* type badge */}
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-[#d4a437] backdrop-blur">
            {isMusic ? <Music2 size={11} /> : <Play size={11} />}
            {item.categoryName || item.category?.name || (isMusic ? 'Music' : 'Video')}
          </span>
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
