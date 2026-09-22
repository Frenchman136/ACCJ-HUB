import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { useApi, errMsg } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ManageCategories() {
  const { request } = useApi();
  const toast = useToast();
  const [type, setType] = useState('video');
  const [categories, setCategories] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const load = () =>
    request(`/categories?type=${type}`).then(setCategories).catch(() => setCategories([]));

  useEffect(() => { load(); }, [type]);

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await request('/categories', { method: 'POST', data: { name: newName.trim(), type } });
      setNewName('');
      toast.success('Category created');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const rename = async (id) => {
    try {
      await request(`/categories/${id}`, { method: 'PATCH', data: { name: editName.trim() } });
      setEditingId(null);
      toast.success('Renamed');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (c) => {
    try {
      await request(`/categories/${c._id}`, { method: 'DELETE' });
      toast.success(`Deleted "${c.name}"`);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const onReorder = async (next) => {
    setCategories(next);
    try {
      await request('/categories/reorder', { method: 'POST', data: { orderedIds: next.map((c) => c._id) } });
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1 w-fit">
        {['video', 'music'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              type === t ? 'bg-accent/80 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t} categories
          </button>
        ))}
      </div>

      <form onSubmit={create} className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`New ${type} category... e.g. "Sunday Service"`}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-accent/60"
          aria-label="New category name"
        />
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-blue px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Add
        </motion.button>
      </form>

      <Reorder.Group axis="y" values={categories || []} onReorder={onReorder} className="mt-6 space-y-2">
        <AnimatePresence initial={false}>
          {(categories || []).map((c) => (
            <Reorder.Item
              key={c._id}
              value={c}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <GripVertical size={16} className="cursor-grab text-slate-600 active:cursor-grabbing" aria-label="Drag to reorder" />
              {c.coverImage ? (
                <img src={c.coverImage} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-xs font-bold text-accent-soft">
                  {c.name[0]?.toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                {editingId === c._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-accent/50 bg-ink-900 px-2.5 py-1.5 text-sm text-white outline-none"
                      autoFocus
                    />
                    <button onClick={() => rename(c._id)} aria-label="Save" className="rounded-lg p-1.5 text-emerald-400 hover:bg-white/10">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} aria-label="Cancel" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.count ?? 0} item(s)</p>
                  </>
                )}
              </div>
              {editingId !== c._id && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingId(c._id); setEditName(c.name); }}
                    aria-label="Rename"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-accent-soft"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(c)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {categories?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
          No categories yet. Drag rows to reorder them once created.
        </p>
      )}
    </div>
  );
}
