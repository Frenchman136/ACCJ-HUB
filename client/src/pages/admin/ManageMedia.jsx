import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, Search } from 'lucide-react';
import { useApi, errMsg } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { timeAgo } from '../../lib/utils.js';

export default function ManageMedia() {
  const { request } = useApi();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [type, setType] = useState('video');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // media being edited
  const [categories, setCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () =>
    request('/media', { params: { type, search: search || undefined, limit: 100 } })
      .then(setItems).catch(() => setItems([]));

  useEffect(() => { load(); }, [type, search]);
  useEffect(() => { request(`/categories?type=${type}`).then(setCategories).catch(() => {}); }, [type]);

  const saveEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', editing.title);
    fd.append('description', editing.description || '');
    fd.append('categoryId', editing.category?._id || editing.category || '');
    fd.append('downloadable', String(!!editing.downloadable));
    if (editing.newThumb) fd.append('thumbnail', editing.newThumb);
    try {
      await request(`/media/${editing._id}`, { method: 'PATCH', data: fd });
      toast.success('Updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const doDelete = async (id) => {
    try {
      await request(`/media/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/60 [&>option]:bg-ink-800';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {['video', 'music'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                type === t ? 'bg-accent/80 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search uploads..."
            className={`${input} pl-9`}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        {items === null && <div className="skeleton h-64" />}
        {items?.length === 0 && (
          <p className="bg-white/[0.02] p-10 text-center text-sm text-slate-500">No uploads yet.</p>
        )}
        <div className="divide-y divide-white/5 bg-white/[0.02]">
          {items?.map((m) => (
            <motion.div
              key={m._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 px-4 py-3"
            >
              <img src={m.thumbnailUrl} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{m.title}</p>
                <p className="text-xs text-slate-500">
                  {m.categoryName || ''} · {m.likesCount} likes · {m.views} views · {timeAgo(m.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setEditing({ ...m, newThumb: null })}
                aria-label="Edit"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-accent-soft"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setConfirmDelete(m)}
                aria-label="Delete"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* edit modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
            />
            <motion.form
              onSubmit={saveEdit}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              className="glass fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">Edit media</h3>
                <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={input} aria-label="Title" />
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={`${input} resize-none`} aria-label="Description" />
                <select
                  value={editing.category?._id || editing.category || ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className={input}
                  aria-label="Category"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <label className="flex items-center gap-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editing.downloadable}
                    onChange={(e) => setEditing({ ...editing, downloadable: e.target.checked })}
                    className="h-4 w-4 accent-[#d4a437]"
                  />
                  Allow downloads
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-accent-soft">
                  Replace thumbnail
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setEditing({ ...editing, newThumb: e.target.files[0] })}
                  />
                </label>
                {editing.newThumb && (
                  <img src={URL.createObjectURL(editing.newThumb)} alt="new thumbnail" className="h-20 w-36 rounded-lg object-cover" />
                )}
              </div>
              <button type="submit" className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-accent-blue py-2.5 text-sm font-semibold text-white">
                Save changes
              </button>
            </motion.form>
          </>
        )}
      </AnimatePresence>

      {/* delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 text-center shadow-card"
            >
              <p className="font-display text-lg font-bold text-white">Delete this {confirmDelete.type}?</p>
              <p className="mt-2 text-sm text-slate-400">"{confirmDelete.title}" will be permanently removed from Cloudinary and the database.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDelete(null)} className="rounded-xl bg-white/10 py-2.5 text-sm font-medium text-slate-200">
                  Cancel
                </button>
                <button onClick={() => doDelete(confirmDelete._id)} className="rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
