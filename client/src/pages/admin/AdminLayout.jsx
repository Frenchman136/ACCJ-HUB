import { NavLink, Outlet } from 'react-router-dom';
import { Upload, Library, FolderCog, Users } from 'lucide-react';

const tabs = [
  { to: '/admin/upload', icon: Upload, label: 'Upload' },
  { to: '/admin/media', icon: Library, label: 'Media' },
  { to: '/admin/categories', icon: FolderCog, label: 'Categories' },
  { to: '/admin/admins', icon: Users, label: 'Admins' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 md:pb-16">
      <h1 className="font-display text-3xl font-bold">
        <span className="grad-text">Admin</span> <span className="text-white">Dashboard</span>
      </h1>
      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-accent to-accent-blue text-white shadow-glow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
