import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Play, Radio, Search } from "lucide-react";

const heroSlides = [
  {
    image: "/artists/Chacho%20Majunga.jpeg",
    eyebrow: "A new spotlight",
    title: "Beyond the Screen",
    caption: "Stories that move with you",
  },
  {
    image: "/artists/Aura.jpg",
    eyebrow: "Featured premiere",
    title: "The Green Room",
    caption: "An intimate journey in motion",
  },
  {
    image: "/artists/Chacho%20Majunga.jpeg",
    eyebrow: "Fresh from the studio",
    title: "Midnight Sessions",
    caption: "The sound of the city",
  },
];

const posterItems = [
  {
    title: "The Last Horizon",
    views: "24.8M",
    tagline: "Epic adventure",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
  {
    title: "Neon City",
    views: "18.2M",
    tagline: "Drama series",
    image: "/artists/Aura.jpg",
  },
  {
    title: "After Midnight",
    views: "12.9M",
    tagline: "Original film",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
  {
    title: "Silent Echoes",
    views: "9.4M",
    tagline: "Documentary",
    image: "/artists/Aura.jpg",
  },
  {
    title: "The Long Way Home",
    views: "7.1M",
    tagline: "Story series",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
];

const featureItems = [
  {
    day: "24",
    month: "JUN",
    title: "A Night in the City",
    blurb: "Stories from the edge of midnight",
    image: "/artists/Aura.jpg",
  },
  {
    day: "25",
    month: "JUN",
    title: "The Sound of Home",
    blurb: "A new emotional portrait",
    image: "/artists/Chacho%20Majunga.jpeg",
  },
  {
    day: "26",
    month: "JUN",
    title: "Sunday Stories",
    blurb: "The latest chapter is live",
    image: "/artists/Aura.jpg",
  },
];

const sectionTitle = "text-base font-bold tracking-tight text-white sm:text-lg";

export default function Videos() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-green-500/30">
      <header className="fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-white/10 bg-gradient-to-b from-[#080808]/95 via-[#080808]/80 to-transparent px-4 backdrop-blur-xl sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Sound Groove home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-500 shadow-[0_0_24px_rgba(34,197,94,0.35)]">
            <Radio size={18} className="text-[#071a0d]" />
          </span>
          <span className="font-display text-sm font-extrabold tracking-tight">
            Sound <span className="text-green-400">Groove</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label="Search videos"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-green-500 hover:text-[#071a0d]"
        >
          <Search size={18} />
        </button>
      </header>

      <main className="pb-28 pt-16 md:pb-16 md:pt-32">
        <section className="relative h-[76vh] min-h-[610px] w-full overflow-hidden bg-[#111] sm:h-[82vh]">
          <motion.img
            key={slide.image}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[82%] sm:max-w-lg"
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-green-300">
                {slide.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-3 text-sm text-white/65 sm:text-base">
                {slide.caption}
              </p>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-green-400/70 hover:bg-green-500 hover:text-[#071a0d]"
              >
                <Play size={16} fill="currentColor" /> Watch free
              </button>
            </motion.div>

            <div className="mt-5 flex items-center justify-end gap-2 sm:mt-6">
              {heroSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeSlide
                      ? "w-8 bg-green-400"
                      : "w-1.5 bg-white/45 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 pt-7 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-400">
                Pick up where you left off
              </p>
              <h2 className={sectionTitle}>Continue watching</h2>
            </div>
            <span className="text-xs text-white/40">Episode 4 of 8</span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111] p-3 shadow-2xl">
            <div className="flex gap-3">
              <div className="relative w-[42%] shrink-0 overflow-hidden rounded-2xl bg-black">
                <img
                  src="/artists/Aura.jpg"
                  alt="Continue watching poster"
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md">
                    <Play size={17} fill="currentColor" />
                  </span>
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
                <p className="truncate font-display text-base font-bold text-white">
                  The Green Room
                </p>
                <p className="mt-1 text-xs text-white/45">Episode 4 of 8</p>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[54%] rounded-full bg-green-400" />
                </div>
                <p className="mt-2 text-[10px] font-medium text-white/35">
                  54% watched
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionTitle}>You may like</h2>
            <button
              type="button"
              aria-label="View more videos"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/55 transition hover:border-green-400/50 hover:text-green-400"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {posterItems.map((item) => (
              <article
                key={item.title}
                className="group w-[62%] min-w-[62%] snap-start sm:w-[44%] sm:min-w-[44%]"
              >
                <div className="relative overflow-hidden rounded-[1.4rem] bg-[#151515] shadow-2xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md">
                    <Play size={14} fill="currentColor" />
                  </span>
                </div>
                <h3 className="mt-3 truncate text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-white/40">
                  <Flame size={11} className="shrink-0 text-green-400" />
                  {item.views}
                  <span className="text-white/20">•</span>
                  {item.tagline}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 pt-1 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionTitle}>Daily new</h2>
            <span className="text-xs text-green-400">Updated now</span>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {featureItems.map((item) => (
              <article
                key={item.title}
                className="group relative h-[300px] w-[85%] min-w-[85%] snap-start overflow-hidden rounded-[1.6rem] bg-[#181818] shadow-2xl sm:h-[340px]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/10" />
                <div className="absolute left-5 top-5 text-white">
                  <p className="font-display text-5xl font-black leading-none tracking-[-0.06em]">
                    {item.day}
                  </p>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-green-300">
                    {item.month}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="max-w-[80%] font-display text-2xl font-extrabold leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 truncate text-xs text-white/55">
                    {item.blurb}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionTitle}>Anime</h2>
            <button
              type="button"
              className="text-xs font-semibold text-green-400"
            >
              See all
            </button>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {posterItems
              .slice()
              .reverse()
              .map((item) => (
                <article
                  key={`${item.title}-anime`}
                  className="group w-[62%] min-w-[62%] snap-start sm:w-[44%] sm:min-w-[44%]"
                >
                  <div className="relative overflow-hidden rounded-[1.4rem] bg-[#151515]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-green-500 text-[#071a0d]">
                      <Play size={14} fill="currentColor" />
                    </span>
                  </div>
                  <h3 className="mt-3 truncate text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-white/40">
                    <Flame size={11} className="text-green-400" />
                    {item.views} <span className="text-white/20">•</span>{" "}
                    {item.tagline}
                  </p>
                </article>
              ))}
          </div>
        </section>

        <section className="px-4 sm:px-6">
          <div className="relative min-h-[340px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-[#18281c] via-[#10140f] to-[#0a0d0a] p-5 shadow-2xl">
            <div className="absolute -right-16 -top-20 h-64 w-64 rotate-12 rounded-[2.5rem] border border-green-300/20 bg-green-500/10 shadow-[0_0_80px_rgba(34,197,94,0.16)]" />
            <div className="absolute right-6 top-9 h-52 w-36 -rotate-6 overflow-hidden rounded-2xl border border-white/20 bg-[#171717] shadow-2xl sm:right-12">
              <img
                src="/artists/Aura.jpg"
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="absolute right-24 top-16 h-52 w-36 rotate-6 overflow-hidden rounded-2xl border border-white/20 bg-[#171717] shadow-2xl sm:right-32">
              <img
                src="/artists/Chacho%20Majunga.jpeg"
                alt=""
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="relative z-10 flex h-full min-h-[290px] flex-col justify-end">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-300">
                #1 this week
              </p>
              <h2 className="mt-2 max-w-[75%] font-display text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                The chart is moving.
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/50">
                The stories everyone is watching right now.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold text-[#071a0d] shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              >
                Explore ranking <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 pt-10 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionTitle}>Million plays</h2>
            <button
              type="button"
              className="text-xs font-semibold text-green-400"
            >
              See all
            </button>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {posterItems.map((item) => (
              <article
                key={`${item.title}-million`}
                className="group w-[62%] min-w-[62%] snap-start sm:w-[44%] sm:min-w-[44%]"
              >
                <div className="relative overflow-hidden rounded-[1.4rem] bg-[#151515]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md">
                    <Play size={14} fill="currentColor" />
                  </span>
                </div>
                <h3 className="mt-3 truncate text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-white/40">
                  <Flame size={11} className="text-green-400" />
                  {item.views} <span className="text-white/20">•</span>{" "}
                  {item.tagline}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
