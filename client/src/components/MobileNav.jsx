import { NavLink } from "react-router-dom";
import { Clapperboard, Music2, UserRound } from "lucide-react";

export default function MobileNav() {
  const items = [
    { to: "/videos", icon: Clapperboard, label: "Videos" },
    { to: "/music", icon: Music2, label: "Music" },
    { to: "/profile", icon: UserRound, label: "Profile" },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-white/10 bg-[#171717]/90 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl md:bottom-auto md:left-1/2 md:right-auto md:top-[72px] md:w-auto md:-translate-x-1/2 md:justify-center md:gap-1 md:rounded-full md:border md:border-white/10 md:bg-[#111]/90 md:px-2 md:py-1.5 md:shadow-[0_10px_35px_rgba(0,0,0,0.38)]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl px-5 py-1.5 text-[11px] font-medium transition-colors md:flex-row md:gap-2 md:px-4 md:py-1.5 md:text-xs ${
              isActive
                ? "bg-white/[0.07] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`rounded-full px-4 py-0.5 transition-colors md:px-2 md:py-0 ${
                  isActive
                    ? "bg-green-500/15 text-green-300"
                    : "bg-transparent text-slate-500"
                }`}
              >
                <Icon size={20} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
