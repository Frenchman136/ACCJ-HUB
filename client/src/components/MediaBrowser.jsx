import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useApi } from '../lib/api.js';
import MediaCard from './MediaCard.jsx';
import CategoryPills from './CategoryPills.jsx';
import SkeletonCard from './SkeletonCard.jsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'likes', label: 'Most liked' },
  { value: 'comments', label: 'Most commented' },
  { value: 'views', label: 'Most viewed' },
];

/** Shared, filterable media grid used by both Videos and Music pages. */
export default function MediaBrowser({ type }) {
  const { request } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('newest');
  const activeCat = searchParams.get('cat') || '';

  useEffect(() => {
    request(`/categories?type=${type}`).then(setCategories).catch(() => {});
  }, [type]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const data = await request('/media', {
          params: { type, category: activeCat || undefined, search: search || undefined, sort },
        });
        setItems(data);
      } catch {
        setItems([]);
      }
    }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [type, activeCat, search, sort]);

  const setCat = (cat) =>
    setSearchParams((p) => {
      const next = new URLSearchParams(p);
      cat ? next.set('cat', cat) : next.delete('cat');
      return next;
    });

  const title = type === 'music' ? 'Music' : 'Videos';
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
        {type === 'music'
          ? 'Worship, choir, and gospel mixes — press play and keep browsing.'
          : 'Services, events, and moments — stream them all in one place.'}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              aria-label="Search"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent/60 focus:shadow-glow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none transition-colors focus:border-accent/60 [&>option]:bg-ink-800"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CategoryPills categories={categories} active={activeCat} onChange={setCat} />
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items === null &&
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        {items?.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            <p className="text-lg font-medium">Nothing here yet</p>
            <p className="mt-1 text-sm">Try a different search or category.</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {items?.map((item, i) => <MediaCard key={item._id} item={item} index={i} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
