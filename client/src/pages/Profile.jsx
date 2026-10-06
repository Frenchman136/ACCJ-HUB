import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  LogIn,
  LogOut,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useApi } from "../lib/api.js";
import MediaCard from "../components/MediaCard.jsx";

export default function Profile() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { openSignIn, signOut } = useClerk();
  const { request } = useApi();
  const [liked, setLiked] = useState(null);
  const role = user?.publicMetadata?.role || "user";

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLiked([]);
      return;
    }
    request("/media/liked")
      .then(setLiked)
      .catch(() => setLiked([]));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-white/45">
        Loading your account...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-10 sm:px-6 md:pb-16 md:pt-28">
      {/* identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,.13),rgba(255,255,255,.04)_48%,rgba(255,255,255,.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.28)] sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-green-400/10" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-green-400/45 bg-[#171a18] shadow-[0_0_36px_rgba(34,197,94,.15)]">
            {isSignedIn && user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Your account photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound size={34} className="text-white/35" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-green-300/75">
              {isSignedIn ? "Your account" : "Member profile"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {isSignedIn
                ? user.fullName || user.username || "Sound Groove member"
                : "Welcome to Sound Groove"}
            </h1>
            <p className="mt-1 break-all text-sm text-slate-400">
              {isSignedIn
                ? user.primaryEmailAddress?.emailAddress || "Email not provided"
                : "Sign in to view your profile and liked media."}
            </p>
            {isSignedIn ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    role === "super_admin"
                      ? "bg-green-500/15 text-green-300"
                      : role === "admin"
                        ? "bg-green-500/10 text-green-200"
                        : "bg-white/[0.07] text-white/60"
                  }`}
                >
                  {role === "super_admin" ? (
                    <ShieldCheck size={13} />
                  ) : (
                    <Shield size={13} />
                  )}
                  {role.replace("_", " ")}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 transition hover:border-green-400/45 hover:bg-green-400/10 hover:text-white"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openSignIn()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold text-[#071a0d] shadow-[0_8px_28px_rgba(34,197,94,.2)] transition hover:bg-green-400"
              >
                <LogIn size={16} /> Sign in
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {isSignedIn && (
        <>
          {/* liked media */}
          <section className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <Heart size={18} className="text-accent-soft" /> Liked media
              <span className="text-sm font-medium text-slate-500">
                {liked?.length ?? ""}
              </span>
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {liked === null &&
                [...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
                ))}
              {liked?.length === 0 && (
                <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                  Nothing liked yet — tap the heart on anything you love.
                </p>
              )}
              {liked?.map((item, i) => (
                <MediaCard key={item._id} item={item} index={i} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
