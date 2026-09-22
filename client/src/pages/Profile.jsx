import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Shield, ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/api.js';
import MediaCard from '../components/MediaCard.jsx';
import { timeAgo } from '../lib/utils.js';

export default function Profile() {
  const { user } = useUser();
  const { request } = useApi();
  const [liked, setLiked] = useState(null);
  const [comments, setComments] = useState(null);
  const role = user?.publicMetadata?.role || 'user';

  useEffect(() => {
    request('/media/liked').then(setLiked).catch(() => setLiked([]));
    request('/me/comments').then(setComments).catch(() => setComments([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-10 sm:px-6 md:pb-16">
      {/* identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass flex flex-col items-center gap-5 rounded-3xl p-8 sm:flex-row sm:items-start"
      >
        <img
          src={user.imageUrl}
          alt={user.fullName}
          className="h-24 w-24 rounded-full border-2 border-accent/50 object-cover shadow-glow-sm"
        />
        <div className="text-center sm:text-left">
          <h1 className="font-display text-2xl font-bold text-white">
            {user.fullName || user.username}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {user.primaryEmailAddress?.emailAddress}
          </p>
          <span
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              role === 'super_admin'
                ? 'bg-amber-500/15 text-amber-300'
                : role === 'admin'
                  ? 'bg-accent/15 text-accent-soft'
                  : 'bg-white/5 text-slate-400'
            }`}
          >
            {role === 'super_admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
            {role.replace('_', ' ')}
          </span>
        </div>
      </motion.div>

      {/* liked media */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <Heart size={18} className="text-accent-soft" /> Liked media
          <span className="text-sm font-medium text-slate-500">{liked?.length ?? ''}</span>
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {liked === null && [...Array(4)].map((_, i) => <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />)}
          {liked?.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              Nothing liked yet — tap the heart on anything you love.
            </p>
          )}
          {liked?.map((item, i) => <MediaCard key={item._id} item={item} index={i} />)}
        </div>
      </section>

      {/* comment history */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <MessageCircle size={18} className="text-accent-soft" /> Comment history
        </h2>
        <div className="mt-5 space-y-3">
          {comments === null && [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          {comments?.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              No comments yet.
            </p>
          )}
          {comments?.map((c) => (
            <Link
              key={c._id}
              to={`/${c.media?.type === 'music' ? 'music' : 'videos'}/${c.media?._id}`}
              className="glass block rounded-2xl p-4 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold text-accent-soft">
                  {c.media?.title || 'Deleted media'}
                </span>
                <span className="shrink-0 text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-slate-300">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
