import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cast,
  ChevronDown,
  Maximize,
  MoreHorizontal,
  Pause,
  Play,
  Settings,
  Share2,
  Shuffle,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import LikeButton from "./LikeButton.jsx";
import CommentSection from "./CommentSection.jsx";
import { timeAgo } from "../lib/utils.js";

const filters = ["All", "From this channel", "Related", "Recently uploaded"];

function formatTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function VideoWatch({
  media,
  related,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onShare,
}) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [duration, setDuration] = useState(media.duration || 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const revealControls = () => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = window.setTimeout(
        () => setControlsVisible(false),
        2600,
      );
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
    revealControls();
  };

  const seek = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !videoRef.current || !duration) return;
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width),
    );
    videoRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const toggleFullscreen = () => {
    const player = videoRef.current?.parentElement;
    if (!document.fullscreenElement) player?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const channelName =
    media.channel?.name || media.artist || media.userName || "Sound Groove";
  const avatar =
    media.channel?.avatar || media.artistAvatar || media.thumbnailUrl;
  const viewCount = Number(media.views || 0).toLocaleString();
  const collaborators = media.collaborators || [];

  return (
    <div className="min-h-screen bg-[#080808] pb-28 text-white md:pb-20">
      <>
        <section
          className={
            minimized
              ? "fixed inset-x-0 bottom-16 z-[70] h-20 bg-[#151515] shadow-2xl md:bottom-0"
              : "sticky top-0 z-40 bg-black pt-[env(safe-area-inset-top)]"
          }
        >
          <div
            className={
              minimized
                ? "relative h-full w-full overflow-hidden bg-[#151515]"
                : "relative aspect-video w-full overflow-hidden bg-black"
            }
            onPointerMove={revealControls}
            onClick={revealControls}
          >
            <video
              ref={videoRef}
              src={media.url}
              poster={media.thumbnailUrl || undefined}
              autoPlay
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) =>
                setDuration(event.currentTarget.duration || media.duration || 0)
              }
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
              onProgress={(event) => {
                const ranges = event.currentTarget.buffered;
                if (ranges.length && duration)
                  setBuffered((ranges.end(ranges.length - 1) / duration) * 100);
              }}
              onPlay={() => {
                setPlaying(true);
                revealControls();
              }}
              onPause={() => {
                setPlaying(false);
                setControlsVisible(true);
              }}
              onEnded={() => autoplay && hasNext && onNext?.()}
              onClick={(event) => {
                event.stopPropagation();
                togglePlayback();
              }}
              className={`absolute inset-0 h-full w-full ${minimized ? "object-cover opacity-45" : "object-contain"}`}
              aria-label={`Video: ${media.title}`}
            />

            {minimized && (
              <div className="absolute inset-0 flex items-center gap-3 px-3">
                <button
                  type="button"
                  onClick={() => setMinimized(false)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-bold text-white">
                    {media.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/55">
                    {channelName}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={playing ? "Pause video" : "Play video"}
                  onClick={togglePlayback}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-500 text-[#071a0d]"
                >
                  {playing ? (
                    <Pause size={17} fill="currentColor" />
                  ) : (
                    <Play size={17} fill="currentColor" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Expand video"
                  onClick={() => setMinimized(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white"
                >
                  <Maximize size={17} />
                </button>
              </div>
            )}

            {!minimized && (
              <AnimatePresence>
                {controlsVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20"
                  >
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-2 sm:px-5">
                      <button
                        type="button"
                        aria-label="Minimize player"
                        onClick={() => setMinimized(true)}
                        className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
                      >
                        <ChevronDown size={23} />
                      </button>
                      <div className="flex items-center gap-1 sm:gap-3">
                        <button
                          type="button"
                          aria-pressed={autoplay}
                          onClick={() => setAutoplay(!autoplay)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${autoplay ? "bg-green-500 text-[#071a0d]" : "bg-white/15 text-white"}`}
                        >
                          <Play size={12} fill="currentColor" /> Autoplay
                        </button>
                        <button
                          type="button"
                          aria-label="Cast"
                          className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
                        >
                          <Cast size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label="Toggle captions"
                          aria-pressed={captions}
                          onClick={() => setCaptions(!captions)}
                          className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-black ${captions ? "text-green-300" : "text-white"}`}
                        >
                          CC
                        </button>
                        <button
                          type="button"
                          aria-label="Playback settings"
                          className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-14">
                      {hasPrev && (
                        <button
                          type="button"
                          aria-label="Previous video"
                          onClick={(event) => {
                            event.stopPropagation();
                            onPrev?.();
                          }}
                          className="grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                        >
                          <Play
                            size={16}
                            className="rotate-180"
                            fill="currentColor"
                          />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={playing ? "Pause video" : "Play video"}
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePlayback();
                        }}
                        className="grid h-16 w-16 place-items-center text-white drop-shadow-lg"
                      >
                        <span className="sr-only">
                          {playing ? "Pause" : "Play"}
                        </span>
                        {playing ? (
                          <Pause size={42} fill="currentColor" />
                        ) : (
                          <Play size={42} fill="currentColor" />
                        )}
                      </button>
                      {hasNext && (
                        <button
                          type="button"
                          aria-label="Next video"
                          onClick={(event) => {
                            event.stopPropagation();
                            onNext?.();
                          }}
                          className="grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 sm:px-5">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-medium tabular-nums text-white">
                        <span>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <button
                          type="button"
                          aria-label="Fullscreen"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFullscreen();
                          }}
                          className="grid h-8 w-8 place-items-center rounded-full bg-black/40"
                        >
                          <Maximize size={17} />
                        </button>
                      </div>
                      <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Seek video"
                        aria-valuemin={0}
                        aria-valuemax={Math.round(duration)}
                        aria-valuenow={Math.round(currentTime)}
                        onClick={(event) => {
                          event.stopPropagation();
                          seek(event);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowRight" && videoRef.current)
                            videoRef.current.currentTime = Math.min(
                              duration,
                              currentTime + 5,
                            );
                          if (event.key === "ArrowLeft" && videoRef.current)
                            videoRef.current.currentTime = Math.max(
                              0,
                              currentTime - 5,
                            );
                        }}
                        className="group/seek relative h-1 cursor-pointer bg-white/20"
                      >
                        <span
                          className="absolute inset-y-0 left-0 bg-white/35"
                          style={{ width: `${buffered}%` }}
                        />
                        <span
                          className="absolute inset-y-0 left-0 bg-green-500"
                          style={{
                            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          }}
                        />
                        <span
                          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400 opacity-0 group-hover/seek:opacity-100"
                          style={{
                            left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            {!minimized && !controlsVisible && (
              <button
                type="button"
                aria-label="Show player controls"
                onClick={revealControls}
                className="absolute inset-0"
              />
            )}
          </div>
        </section>

        <main className="mx-auto max-w-3xl">
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 py-3 pl-4 sm:pl-6">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold ${activeFilter === filter ? "bg-white text-black" : "bg-white/[0.09] text-white"} ${index === filters.length - 1 ? "mr-4" : ""}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="block w-full px-4 pt-4 text-left sm:px-6"
          >
            <span
              className={`block truncate font-display text-lg font-bold ${detailsOpen ? "whitespace-normal" : ""}`}
            >
              {media.title}
            </span>
          </button>

          {detailsOpen && (
            <section className="mx-3 mt-3 rounded-t-2xl bg-[#171717] p-4 sm:mx-5 sm:p-5">
              <p className="text-xs text-white/50">
                <strong className="text-white">
                  @{channelName.replace(/\s+/g, "").toLowerCase()}
                </strong>
                {collaborators.length > 0 && ` +${collaborators.length}`}{" "}
                <span className="mx-1">·</span>
                {viewCount} views <span className="mx-1">·</span>
                {timeAgo(media.createdAt)}{" "}
                <button type="button" className="ml-1 font-bold text-white">
                  more
                </button>
              </p>
              {media.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {media.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={avatar}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">{channelName}</span>
                  <button
                    type="button"
                    className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
                  >
                    Subscribe
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <LikeButton
                    mediaId={media._id}
                    initialLiked={media.myLike}
                    initialCount={media.likes?.length || 0}
                  />
                  <button
                    type="button"
                    aria-label="Dislike"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
                  >
                    <ThumbsDown size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Share"
                    onClick={onShare}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="AI assist"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-green-300"
                  >
                    <Sparkles size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="More options"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="mx-3 mt-3 block w-[calc(100%-1.5rem)] rounded-xl bg-[#191919] p-4 text-left sm:mx-5 sm:w-[calc(100%-2.5rem)]"
          >
            <span className="flex items-center justify-between">
              <span className="font-bold">
                Comments{" "}
                <span className="ml-1 text-sm font-medium text-white/45">
                  {media.commentsCount ?? 0}
                </span>
              </span>
              <span className="text-xs text-white/35">···</span>
            </span>
            <span className="mt-3 flex items-center gap-2 text-sm text-white/65">
              <img
                src={avatar}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
              Join the conversation
            </span>
          </button>

          <div className="mt-4 space-y-5 px-4 sm:px-6">
            {related.map((item) => (
              <Link key={item._id} to={`/videos/${item._id}`} className="block">
                <div className="relative aspect-video w-full bg-[#171717]">
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-1 text-[10px] font-semibold text-white">
                    {formatTime(item.duration)}
                  </span>
                </div>
                <div className="mt-2 flex items-start gap-3">
                  <img
                    src={item.artistAvatar || item.thumbnailUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm font-bold text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-white/45">
                      {item.artist || "Sound Groove"} ·{" "}
                      {Number(item.views || 0).toLocaleString()} views ·{" "}
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                  <MoreHorizontal
                    size={19}
                    className="shrink-0 text-white/45"
                  />
                </div>
              </Link>
            ))}
          </div>
        </main>
      </>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#111] px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-display text-lg font-bold">Comments</h2>
              <button
                type="button"
                aria-label="Close comments"
                onClick={() => setCommentsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mx-auto max-w-3xl">
              <CommentSection mediaId={media._id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
