import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useApi, errMsg } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { timeAgo } from '../lib/utils.js';

export default function CommentSection({ mediaId }) {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const toast = useToast();

  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () =>
    request(`/media/${mediaId}/comments`).then(setComments).catch(() => setComments([]));

  useEffect(() => { load(); }, [mediaId]);

  const post = async (e) => {
    e?.preventDefault();
    if (!isSignedIn) return openSignIn();
    if (!text.trim()) return;
    setSending(true);
    try {
      const comment = await request(`/media/${mediaId}/comments`, {
        method: 'POST',
        data: { text: text.trim() },
      });
      setComments((c) => [comment, ...(c || [])]);
      setText('');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (id) => {
    try {
      const updated = await request(`/comments/${id}`, { method: 'PATCH', data: { text: editText } });
      setComments((c) => c.map((x) => (x._id === id ? updated : x)));
      setEditingId(null);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (id) => {
    try {
      await request(`/comments/${id}`, { method: 'DELETE' });
      setComments((c) => c.filter((x) => x._id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const myId = user?.id;
  const role = user?.publicMetadata?.role;
  const canModerate = role === 'admin' || role === 'super_admin';

  return (
    <section className="mt-10" aria-label="Comments">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
        <MessageCircle size={20} className="text-accent-soft" />
        Comments
        <span className="text-sm font-medium text-slate-500">{comments?.length ?? 0}</span>
      </h2>

      <form onSubmit={post} className="mt-5 flex gap-3">
        {isSignedIn ? (
          <img src={user.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-slate-400">
            ?
          </span>
        )}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={() => !isSignedIn && openSignIn()}
            placeholder={isSignedIn ? 'Share your thoughts...' : 'Sign in to comment'}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent/60 focus:shadow-glow-sm"
          />
          <div className="mt-2 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={sending || !text.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-glow-sm disabled:opacity-40"
            >
              <Send size={14} /> {sending ? 'Posting...' : 'Post'}
            </motion.button>
          </div>
        </div>
      </form>

      <div className="mt-8 space-y-5">
        {comments === null &&
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-28 rounded-md" />
                <div className="skeleton h-4 w-full rounded-md" />
              </div>
            </div>
          ))}

        <AnimatePresence initial={false}>
          {comments?.map((c) => (
            <motion.div
              key={c._id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex gap-3"
            >
              {c.userAvatar ? (
                <img src={c.userAvatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-blue text-xs font-bold text-white">
                  {c.userName?.[0]?.toUpperCase() || 'A'}
                </span>
              )}
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="text-sm font-semibold text-white">{c.userName}</span>
                  <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                  {c.edited && <span className="text-[10px] italic text-slate-600">edited</span>}
                </div>
                {editingId === c._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(c._id)}
                        className="rounded-lg bg-accent/80 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{c.text}</p>
                )}
              </div>
              {(c.userId === myId || canModerate) && editingId !== c._id && (
                <div className="flex flex-col gap-1">
                  {c.userId === myId && (
                    <button
                      onClick={() => { setEditingId(c._id); setEditText(c.text); }}
                      aria-label="Edit comment"
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-accent-soft"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(c._id)}
                    aria-label="Delete comment"
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
