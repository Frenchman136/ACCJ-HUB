import { Link, NavLink, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { LogIn, LogOut, User as UserIcon, Shield, Radio } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const adminRoles = ["admin", "super_admin"];

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const { signOut, openSignIn } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const role = user?.publicMetadata?.role || "user";

  useEffect(() => {
    const close = (e) =>
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      setMenuOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const links = [
    { to: "/videos", label: "Videos" },
    { to: "/music", label: "Music" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-blue shadow-glow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Radio size={18} className="text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="grad-text">Sound</span>{" "}
            <span className="text-white">Groove</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav-link text-sm font-medium transition-colors ${isActive ? "active text-white" : "text-slate-400 hover:text-white"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {isSignedIn && adminRoles.includes(role) && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link text-sm font-medium transition-colors ${isActive ? "active text-white" : "text-slate-400 hover:text-white"}`
              }
            >
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3" ref={menuRef}>
          {isSignedIn ? (
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition-colors hover:border-accent/50"
                aria-label="Account menu"
              >
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "avatar"}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="hidden max-w-[8rem] truncate text-sm text-slate-200 sm:block">
                  {user.firstName || "Me"}
                </span>
              </motion.button>

              <motion.div
                initial={false}
                animate={
                  menuOpen
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                style={{ pointerEvents: menuOpen ? "auto" : "none" }}
                className="glass absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl p-1.5 shadow-card"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10"
                >
                  <UserIcon size={16} /> Profile
                </button>
                {adminRoles.includes(role) && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10"
                  >
                    <Shield size={16} /> Admin dashboard
                  </button>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openSignIn()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-glow-sm"
            >
              <LogIn size={16} /> Sign in
            </motion.button>
          )}
        </div>
      </nav>
    </header>
  );
}
