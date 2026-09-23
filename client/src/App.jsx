import { useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastProvider } from "./context/ToastContext.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import Navbar from "./components/Navbar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import StickyAudioPlayer from "./components/StickyAudioPlayer.jsx";
import { SignedInOnly, AdminOnly } from "./components/Protected.jsx";

import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";
import Music from "./pages/Music.jsx";
import MediaDetail from "./pages/MediaDetail.jsx";
import CollectionDetail from "./pages/CollectionDetail.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import UploadMedia from "./pages/admin/UploadMedia.jsx";
import ManageMedia from "./pages/admin/ManageMedia.jsx";
import ManageCategories from "./pages/admin/ManageCategories.jsx";
import ManageAdmins from "./pages/admin/ManageAdmins.jsx";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function SetupHint() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold grad-text">
          Sound Groove needs configuration
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          Create{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">client/.env</code>{" "}
          from{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">
            client/.env.example
          </code>{" "}
          and add your{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">
            VITE_CLERK_PUBLISHABLE_KEY
          </code>
          . Then restart the dev server.
        </p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (touchStartX.current == null || touchStartY.current == null || !touch)
      return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (Math.abs(deltaX) < 60 || Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const current = location.pathname.startsWith("/videos")
      ? "/videos"
      : location.pathname.startsWith("/music")
        ? "/music"
        : "/";

    const sectionOrder = ["/", "/videos", "/music"];
    const index = sectionOrder.indexOf(current);
    const nextIndex = deltaX < 0 ? index + 1 : index - 1;
    const target = sectionOrder[nextIndex];

    if (target && index !== -1) {
      navigate(target);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/videos/:id" element={<MediaDetail />} />
          <Route path="/videos/artist/:slug" element={<CollectionDetail />} />
          <Route path="/videos/album/:slug" element={<CollectionDetail />} />
          <Route path="/music" element={<Music />} />
          <Route path="/music/:id" element={<MediaDetail />} />
          <Route path="/music/artist/:slug" element={<CollectionDetail />} />
          <Route path="/music/album/:slug" element={<CollectionDetail />} />
          <Route
            path="/profile"
            element={
              <SignedInOnly>
                <Profile />
              </SignedInOnly>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminOnly>
                <AdminLayout />
              </AdminOnly>
            }
          >
            <Route index element={<UploadMedia />} />
            <Route path="upload" element={<UploadMedia />} />
            <Route path="media" element={<ManageMedia />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="admins" element={<ManageAdmins />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  if (!PUBLISHABLE_KEY) return <SetupHint />;
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ToastProvider>
        <PlayerProvider>
          <div className="min-h-screen">
            <Navbar />
            <AnimatedRoutes />
            <StickyAudioPlayer />
            <MobileNav />
          </div>
        </PlayerProvider>
      </ToastProvider>
    </ClerkProvider>
  );
}
