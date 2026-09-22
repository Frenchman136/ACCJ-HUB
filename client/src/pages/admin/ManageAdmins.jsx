import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Shield, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useApi, errMsg } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { timeAgo } from '../../lib/utils.js';

export default function ManageAdmins() {
  const { user: me } = useUser();
  const { request } = useApi();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');

  const myRole = me?.publicMetadata?.role || 'user';
  const isSuper = myRole === 'super_admin';
  const superId = users?.find((u) => u.role === 'super_admin')?.id;

  const load = () =>
    request('/users').then(setUsers).catch((e) => {
      toast.error(errMsg(e));
      setUsers([]);
    });

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try {
      await request(`/users/${id}/${action}`, { method: 'POST' });
      toast.success(action === 'promote' ? 'Promoted to admin' : 'Demoted to user');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const filtered = users?.filter((u) =>
    [u.name, u.email].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl">
      {!isSuper && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Only the super admin can promote or demote admins. You have read-only access.
        </p>
      )}

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/60"
          aria-label="Search members"
        />
      </div>

      <div className="mt-5 space-y-2">
        {users === null && [...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        {filtered?.map((u) => (
          <motion.div
            key={u.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass flex items-center gap-4 rounded-2xl px-4 py-3"
          >
            <img src={u.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                {u.name}
                {u.role !== 'user' &&
                  (u.role === 'super_admin' ? (
                    <ShieldCheck size={14} className="shrink-0 text-amber-400" />
                  ) : (
                    <Shield size={14} className="shrink-0 text-accent-soft" />
                  ))}
              </p>
              <p className="truncate text-xs text-slate-500">
                {u.email} · joined {timeAgo(u.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                u.role === 'super_admin'
                  ? 'bg-amber-500/15 text-amber-300'
                  : u.role === 'admin'
                    ? 'bg-accent/15 text-accent-soft'
                    : 'bg-white/5 text-slate-400'
              }`}
            >
              {u.role.replace('_', ' ')}
            </span>
            {isSuper && u.id !== superId && u.id !== me?.id && (
              u.role === 'admin' ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => act(u.id, 'demote')}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-300"
                >
                  <ArrowDownCircle size={14} /> Demote
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => act(u.id, 'promote')}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-blue px-3 py-2 text-xs font-semibold text-white"
                >
                  <ArrowUpCircle size={14} /> Promote
                </motion.button>
              )
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
