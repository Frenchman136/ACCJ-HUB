import { NavLink } from 'react-router-dom';
import { Home, Clapperboard, Music2 } from 'lucide-react';

export default function MobileNav() {
  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/videos', icon: Clapperboard, label: 'Videos' },
    { to: '/music', icon: Music2, label: 'Music' },
  ];
  return (
    <nav
      aria-label="Mobile navigation"
      className="glass fixed bottom-0 left-0 right-0 z-50 flex justify-around border-x-0 border-b-0 py-2 md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl px-5 py-1.5 text-[11px] font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`rounded-full px-4 py-0.5 transition-colors ${
                  isActive ? 'bg-accent/20 text-accent-soft' : ''
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
