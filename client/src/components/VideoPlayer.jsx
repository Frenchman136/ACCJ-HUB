import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Volume2, VolumeX, Maximize, Minimize, Settings, PictureInPicture2,
} from 'lucide-react';
import { formatDuration, getResume, setResume } from '../lib/utils.js';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Custom video player: auto-hiding controls, hover time preview on the
 * scrubber, ±10s skip, speed control, PiP, fullscreen, keyboard shortcuts,
 * and resume-where-you-left-off.
 */
export default function VideoPlayer({ media, hasPrev, hasNext, onPrev, onNext }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 0);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('accj:vol') ?? 0.9));
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [skipFx, setSkipFx] = useState(null); // -10 | +10 | null
  const [hover, setHover] = useState(null); // { x, time }
  const [buffered, setBuffered] = useState(0);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2000);
  }, [playing]);

  /* ---- resume position ---- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const resumeAt = getResume(media._id);
    const onMeta = () => {
      setDuration(v.duration || media.duration || 0);
      if (resumeAt > 5 && resumeAt < (v.duration || 0) - 10) v.currentTime = resumeAt;
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [media._id]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  /* ---- helpers ---- */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const skip = useCallback((delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || Infinity);
    setSkipFx(delta);
    setTimeout(() => setSkipFx(null), 600);
    showControls();
  }, [showControls]);

  const seekTo = useCallback((t) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setCurrentTime(t);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen();
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch { /* unsupported */ }
  }, []);

  const changeVolume = useCallback((val) => {
    setVolume(val);
    localStorage.setItem('accj:vol', String(val));
    const v = videoRef.current;
    if (v) { v.volume = val; v.muted = val === 0; }
    setMuted(val === 0);
  }, []);

  /* ---- fullscreen change detection ---- */
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const v = videoRef.current;
      if (!v) return;
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'arrowleft': skip(-10); break;
        case 'arrowright': skip(10); break;
        case 'arrowup': e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); break;
        case 'arrowdown': e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); break;
        case 'f': toggleFullscreen(); break;
        case 'm': {
          const nv = !muted;
          setMuted(nv);
          v.muted = nv;
          break;
        }
        default: break;
      }
      showControls();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, changeVolume, volume, muted, toggleFullscreen, showControls]);

  /* ---- progress bar interaction ---- */
  const barRef = useRef(null);
  const barTimeFromEvent = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    return { x: rect.width ? x / rect.width : 0, time: (x / rect.width) * (duration || 0) };
  };
  const onBarHover = (e) => setHover(barTimeFromEvent(e));
  const onBarClick = (e) => seekTo(barTimeFromEvent(e).time);

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-card outline-none"
    >
      <video
        ref={videoRef}
        src={media.url}
        poster={media.thumbnailUrl || undefined}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => { setPlaying(true); showControls(); }}
        onPause={() => { setPlaying(false); setControlsVisible(true); }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.target.currentTime);
          setResume(media._id, e.target.currentTime);
        }}
        onProgress={(e) => {
          const b = e.target.buffered;
          if (b.length && duration) setBuffered((b.end(b.length - 1) / duration) * 100);
        }}
        onEnded={() => {
          setResume(media._id, 0);
          if (hasNext) onNext?.();
        }}
        className="h-full w-full cursor-pointer"
        aria-label={`Video player: ${media.title}`}
      />

      {/* center skip feedback */}
      <AnimatePresence>
        {skipFx && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="flex items-center gap-2 rounded-full bg-ink-950/70 px-5 py-2.5 backdrop-blur">
              {skipFx < 0 ? <Rewind className="text-accent-soft" /> : <FastForward className="text-accent-soft" />}
              <span className="font-display text-lg font-bold text-white">10s</span>
            </div>
          </motion.div>
        )}
        {!playing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            aria-label="Play"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-accent/90 shadow-glow transition-transform hover:scale-110">
              <Play size={32} className="ml-1.5 text-white" fill="currentColor" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* control bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 via-ink-950/60 to-transparent px-4 pb-3 pt-14"
          >
            {/* progress */}
            <div
              ref={barRef}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              tabIndex={0}
              onMouseMove={onBarHover}
              onMouseLeave={() => setHover(null)}
              onClick={onBarClick}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') skip(5);
                if (e.key === 'ArrowLeft') skip(-5);
              }}
              className="group/bar relative mb-3 h-5 cursor-pointer"
            >
              {/* hover time tooltip */}
              {hover && duration > 0 && (
                <div
                  className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-md bg-ink-950/90 px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ left: `${hover.x * 100}%` }}
                >
                  {formatDuration(hover.time)}
                </div>
              )}
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
                <div className="absolute h-full bg-white/25" style={{ width: `${buffered}%` }} />
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-accent to-accent-blue"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-glow transition-opacity group-hover/bar:opacity-100"
                style={{ left: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={() => skip(-10)} aria-label="Back 10 seconds" className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                  <Rewind size={18} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 shadow-glow-sm transition-transform hover:scale-105"
                >
                  {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
                </motion.button>
                <button onClick={() => skip(10)} aria-label="Forward 10 seconds" className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                  <FastForward size={18} />
                </button>

                {hasPrev && (
                  <button onClick={onPrev} aria-label="Previous video" className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                    <SkipBack size={18} />
                  </button>
                )}
                {hasNext && (
                  <button onClick={onNext} aria-label="Next video" className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                    <SkipForward size={18} />
                  </button>
                )}

                <div className="ml-1 flex items-center gap-2">
                  <button
                    onClick={() => { const nv = !muted; setMuted(nv); if (videoRef.current) videoRef.current.muted = nv; }}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={muted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    aria-label="Volume"
                    className="player-range hidden w-20 sm:block"
                    style={{ '--fill': `${(muted ? 0 : volume) * 100}%` }}
                  />
                </div>

                <span className="ml-1 hidden text-xs tabular-nums text-slate-300 sm:block">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>

              <div className="relative flex items-center gap-1">
                {/* speed menu */}
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  aria-label="Playback settings"
                  className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings size={17} />
                </button>
                <button onClick={togglePip} aria-label="Picture in picture" className="hidden rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white sm:block">
                  <PictureInPicture2 size={17} />
                </button>
                <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white">
                  {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="glass absolute bottom-full right-0 mb-2 w-36 overflow-hidden rounded-xl p-1 shadow-card"
                    >
                      {SPEEDS.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSpeed(s); if (videoRef.current) videoRef.current.playbackRate = s; setSettingsOpen(false); }}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            s === speed ? 'text-accent-soft' : 'text-slate-200'
                          }`}
                        >
                          {s}x {s === 1 && '· Normal'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
