import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useApi } from '../lib/api.js';

/** Animated like button with burst particles + optimistic count. */
export default function LikeButton({ mediaId, initialLiked, initialCount, size = 'md' }) {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [burst, setBurst] = useState(0);

  const toggle = async () => {
    if (!isSignedIn) return openSignIn();
    const optimistic = !liked;
    setLiked(optimistic);
    setCount((c) => c + (optimistic ? 1 : -1));
    if (optimistic) setBurst((b) => b + 1);
    try {
      const res = await request(`/media/${mediaId}/like`, { method: 'POST' });
      setLiked(res.liked);
      setCount(res.likesCount);
    } catch {
      setLiked(!optimistic); // roll back
      setCount((c) => c + (optimistic ? -1 : 1));
    }
  };

  const dims = size === 'lg' ? 'h-12 w-12' : 'h-9 w-9';

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={toggle}
        aria-label={liked ? 'Unlike' : 'Like'}
        aria-pressed={liked}
        className={`relative grid ${dims} place-items-center rounded-full border transition-colors ${
          liked
            ? 'border-accent/60 bg-accent/15 text-accent-soft shadow-glow-sm'
            : 'border-white/10 bg-white/5 text-slate-300 hover:border-accent/40 hover:text-accent-soft'
        }`}
      >
        <motion.span
          key={burst}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <Heart size={size === 'lg' ? 22 : 17} fill={liked ? 'currentColor' : 'none'} />
        </motion.span>
        {/* burst particles */}
        <AnimatePresence>
          {burst > 0 && liked && (
            <motion.span key={`p-${burst}`} className="pointer-events-none absolute inset-0" initial={false}>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-accent-soft"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * Math.PI) / 3) * 22,
                    y: Math.sin((i * Math.PI) / 3) * 22,
                    opacity: 0,
                    scale: 0.4,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <motion.span
        key={count}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-sm font-semibold tabular-nums ${liked ? 'text-accent-soft' : 'text-slate-400'}`}
      >
        {count}
      </motion.span>
    </div>
  );
}
