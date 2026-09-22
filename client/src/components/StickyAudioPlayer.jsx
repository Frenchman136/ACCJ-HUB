import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, ListMusic, X,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { formatDuration } from '../lib/utils.js';

const BAR_COUNT = 32;

/** Spotify-style sticky bottom player that survives page navigation. */
export default function StickyAudioPlayer() {
  const p = usePlayer();
  const drawerRef = useRef(null);

  /* Sync the hidden <audio> element with context state */
  useEffect(() => {
    const a = p.audioRef.current;
    if (!a) return;
    if (p.current && a.src !== p.current.url) {
      a.src = p.current.url;
      a.load();
    }
    if (p.current) p.playing ? a.play().catch(() => p.setPlaying(false)) : a.pause();
  }, [p.current, p.playing]);

  useEffect(() => {
    if (p.audioRef.current) p.audioRef.current.volume = p.volume;
  }, [p.volume, p.current]);

  const toggleMute = () => {
    const a = p.audioRef.current;
    if (a) a.muted = !a.muted;
  };

  const pct = p.duration ? p.progress / p.duration : 0;

  return (
    <>
      <audio
        ref={p.audioRef}
        onTimeUpdate={(e) => p.setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => p.setDuration(e.target.duration || 0)}
        onEnded={(e) => {
          if (p.repeat === 'one') {
            e.target.currentTime = 0;
            e.target.play();
          } else p.next();
        }}
      />

      <AnimatePresence>
        {p.current && (
          <motion.div
            initial={{ y: 110 }}
            animate={{ y: 0 }}
            exit={{ y: 110 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="glass fixed inset-x-0 bottom-16 z-40 border-x-0 border-b-0 md:bottom-0"
            role="region"
            aria-label="Now playing"
          >
            {/* waveform progress */}
            <div
              className="flex h-6 cursor-pointer items-end gap-[3px] px-3 pt-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                p.seek(ratio * p.duration);
              }}
              aria-label="Seek"
              role="slider"
              aria-valuemin={0}
              aria-valuemax={Math.round(p.duration)}
              aria-valuenow={Math.round(p.progress)}
            >
              {[...Array(BAR_COUNT)].map((_, i) => {
                const active = i / BAR_COUNT <= pct;
                return (
                  <span
                    key={i}
                    className={`w-full rounded-t transition-colors ${
                      active ? 'bg-gradient-to-t from-accent to-accent-blue' : 'bg-white/15'
                    }`}
                    style={{
                      height: `${18 + 60 * Math.abs(Math.sin(i * 1.7))}%`,
                      transformOrigin: 'bottom',
                      animation: p.playing && active ? `eq 0.9s ease-in-out ${i * 0.05}s infinite` : 'none',
                    }}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-3 px-3 pb-2.5 sm:px-4">
              {/* rotating artwork */}
              <motion.img
                src={p.current.thumbnailUrl}
                alt=""
                animate={{ rotate: p.playing ? 360 : 0 }}
                transition={{ duration: 8, repeat: p.playing ? Infinity : 0, ease: 'linear' }}
                className="h-11 w-11 rounded-full border-2 border-accent/50 object-cover shadow-glow-sm"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{p.current.title}</p>
                <p className="truncate text-xs text-slate-400">
                  {p.current.categoryName || p.current.category?.name || 'Music'} ·{' '}
                  <span className="tabular-nums">
                    {formatDuration(p.progress)} / {formatDuration(p.duration)}
                  </span>
                </p>
              </div>

              {/* transport */}
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                <button
                  onClick={p.toggleShuffle}
                  aria-label="Shuffle"
                  aria-pressed={p.shuffle}
                  className={`rounded-lg p-2 transition-colors ${
                    p.shuffle ? 'text-accent-soft' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle size={16} />
                </button>
                <button onClick={p.prev} aria-label="Previous track" className="rounded-lg p-2 text-slate-200 transition-colors hover:text-white">
                  <SkipBack size={18} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={p.toggle}
                  aria-label={p.playing ? 'Pause' : 'Play'}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-blue text-white shadow-glow-sm"
                >
                  {p.playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} className="ml-0.5" fill="currentColor" />}
                </motion.button>
                <button onClick={p.next} aria-label="Next track" className="rounded-lg p-2 text-slate-200 transition-colors hover:text-white">
                  <SkipForward size={18} />
                </button>
                <button
                  onClick={p.cycleRepeat}
                  aria-label={`Repeat: ${p.repeat}`}
                  className={`rounded-lg p-2 transition-colors ${
                    p.repeat !== 'off' ? 'text-accent-soft' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                </button>
              </div>

              {/* right cluster */}
              <div className="hidden items-center gap-1 sm:flex">
                <button onClick={toggleMute} aria-label="Mute" className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white">
                  {p.volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={p.volume}
                  onChange={(e) => p.changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="player-range w-16"
                  style={{ '--fill': `${p.volume * 100}%` }}
                />
                <button
                  onClick={() => p.setShowQueue(true)}
                  aria-label="Open queue"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
                >
                  <ListMusic size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* queue drawer */}
      <AnimatePresence>
        {p.showQueue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => p.setShowQueue(false)}
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm"
            />
            <motion.aside
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="glass fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-y-0 border-r-0"
              aria-label="Playback queue"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-display font-bold text-white">Up next</h2>
                <button onClick={() => p.setShowQueue(false)} aria-label="Close queue" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {p.queue.map((track, i) => (
                  <button
                    key={track._id}
                    onClick={() => p.playAt(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      i === p.index ? 'bg-accent/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <img src={track.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${i === p.index ? 'text-accent-soft' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">{track.categoryName || ''}</p>
                    </div>
                    {i === p.index && p.playing && (
                      <span className="flex items-end gap-[2px]" aria-label="Playing">
                        {[0, 1, 2].map((b) => (
                          <span
                            key={b}
                            className="w-[3px] rounded bg-accent-soft"
                            style={{ height: 14, transformOrigin: 'bottom', animation: `eq 0.8s ease-in-out ${b * 0.12}s infinite` }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
