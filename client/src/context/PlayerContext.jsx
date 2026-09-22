import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Global audio queue — powers the sticky bottom music player.
 * Survives page navigation because it lives above the Router outlet.
 */
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]); // [{ _id, title, url, thumbnailUrl, categoryName }]
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() =>
    Number(localStorage.getItem("accj:vol") ?? 0.9),
  );
  const [showQueue, setShowQueue] = useState(false);

  const current = index >= 0 ? queue[index] : null;

  const playQueue = useCallback((items, startIndex = 0) => {
    const safeItems = Array.isArray(items) ? items : [];
    if (!safeItems.length) {
      setQueue([]);
      setIndex(-1);
      setPlaying(false);
      return;
    }

    const safeIndex = Math.max(0, Math.min(startIndex, safeItems.length - 1));
    setQueue(safeItems);
    setIndex(safeIndex);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (!current) return;
    setPlaying((p) => !p);
  }, [current]);

  const next = useCallback(() => {
    if (!queue.length) return;
    if (shuffle && queue.length > 1) {
      let n;
      do {
        n = Math.floor(Math.random() * queue.length);
      } while (n === index);
      setIndex(n);
    } else {
      setIndex((i) => (i + 1) % queue.length);
    }
    setPlaying(true);
  }, [queue.length, index, shuffle]);

  const prev = useCallback(
    () => setIndex((i) => (i <= 0 ? queue.length - 1 : i - 1)),
    [queue.length],
  );

  const playAt = useCallback((i) => {
    setIndex(i);
    setPlaying(true);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    [],
  );

  const seek = useCallback((t) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setProgress(t);
    }
  }, []);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    localStorage.setItem("accj:vol", String(v));
  }, []);

  const value = useMemo(
    () => ({
      audioRef,
      queue,
      index,
      current,
      playing,
      shuffle,
      repeat,
      progress,
      duration,
      volume,
      showQueue,
      playQueue,
      toggle,
      next,
      prev,
      playAt,
      toggleShuffle,
      cycleRepeat,
      seek,
      changeVolume,
      setShowQueue,
      setProgress,
      setDuration,
      setPlaying,
    }),
    [
      queue,
      index,
      current,
      playing,
      shuffle,
      repeat,
      progress,
      duration,
      volume,
      showQueue,
      playQueue,
      toggle,
      next,
      prev,
      playAt,
      toggleShuffle,
      cycleRepeat,
      seek,
      changeVolume,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
