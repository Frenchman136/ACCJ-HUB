import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard, Music2, ArrowRight, Flame } from "lucide-react";
import { useApi } from "../lib/api.js";
import MediaCard from "../components/MediaCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

export default function Home() {
  const { request } = useApi();
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState(null);
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    request("/media", { params: { type: "video", sort: "likes", limit: 8 } })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    request("/media", { params: { sort: "views", limit: 8 } })
      .then(setTrending)
      .catch(() => setTrending([]));
    request("/media", { params: { limit: 8 } })
      .then(setRecent)
      .catch(() => setRecent([]));
  }, []);

  const featuredVideo = featured?.[0];

  return (
    <div className="pb-28 md:pb-12">
      {/* HERO */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20"
      >
        <motion.p
          variants={heroItem}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4a437]"
        >
          Apostles Church of Christ Jesus
        </motion.p>
        <motion.h1
          variants={heroItem}
          className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
        >
          <span className="grad-text drop-shadow-[0_0_30px_rgba(212,164,55,0.35)]">
            ACCJ
          </span>{" "}
          <span className="text-white">HUB</span>
        </motion.h1>
        <motion.p
          variants={heroItem}
          className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg"
        >
          Every sermon, every song, every moment — streamed beautifully. Watch
          videos, listen to music, and join the conversation.
        </motion.p>
        <motion.div variants={heroItem} className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/videos"
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-blue px-6 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
          >
            <Clapperboard size={18} />
            Watch videos
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/music"
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition-all hover:border-accent/50 hover:shadow-glow-sm"
          >
            <Music2 size={18} className="text-accent-soft" />
            Listen to music
          </Link>
        </motion.div>
      </motion.section>

      {/* FEATURED CAROUSEL */}
      {featuredVideo && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <SectionTitle>Featured this week</SectionTitle>
          <div className="mt-5 flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((item, i) => (
              <div key={item._id} className="w-[78vw] shrink-0 sm:w-[420px]">
                <MediaCard item={item} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
      {featured === null && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <SectionTitle>Featured this week</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      )}

      {/* TRENDING */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionTitle icon={<Flame size={18} className="text-orange-400" />}>
          Trending now
        </SectionTitle>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trending === null &&
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          {trending?.slice(0, 4).map((item, i) => (
            <MediaCard key={item._id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* RECENTLY ADDED */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <SectionTitle>Recently added</SectionTitle>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent === null &&
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          {recent?.slice(0, 4).map((item, i) => (
            <MediaCard key={item._id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white sm:text-2xl">
      {icon}
      {children}
      <span className="ml-1 h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
    </h2>
  );
}
