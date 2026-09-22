import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clapperboard, Music2, UploadCloud, FileVideo, FileAudio, ImagePlus, X } from 'lucide-react';
import { useApi, errMsg } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function UploadMedia() {
  const { request } = useApi();
  const toast = useToast();
  const navigate = useNavigate();

  const [type, setType] = useState('video');
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [downloadable, setDownloadable] = useState(false);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    request(`/categories?type=${type}`).then(setCategories).catch(() => {});
    setCategoryId('');
  }, [type]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (type === 'video' && !f.type.startsWith('video/')) return toast.error('Please choose a video file');
    if (type === 'music' && !f.type.startsWith('audio/')) return toast.error('Please choose an audio (MP3) file');
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
  };

  const pickThumb = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Choose a file to upload');
    if (!title.trim()) return toast.error('Title is required');
    if (!categoryId && !newCategory.trim()) return toast.error('Pick or create a category');

    const fd = new FormData();
    fd.append('type', type);
    fd.append('title', title);
    fd.append('description', description);
    fd.append('categoryId', categoryId);
    fd.append('newCategory', newCategory);
    fd.append('downloadable', String(downloadable));
    fd.append('file', file);
    if (thumbnail) fd.append('thumbnail', thumbnail);

    setUploading(true);
    try {
      await request('/media', { method: 'POST', data: fd });
      toast.success('Uploaded successfully');
      navigate('/admin/media');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setUploading(false);
    }
  };

  const Input = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:border-accent/60 focus:shadow-glow-sm';

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass max-w-2xl rounded-3xl p-6 sm:p-8"
    >
      {/* type toggle */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'video', icon: Clapperboard, label: 'Video' },
          { value: 'music', icon: Music2, label: 'Music / MP3' },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            aria-pressed={type === t.value}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-semibold transition-all ${
              type === t.value
                ? 'border-accent/60 bg-accent/15 text-white shadow-glow-sm'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25'
            }`}
          >
            <t.icon size={18} className={type === t.value ? 'text-accent-soft' : ''} />
            {t.label}
          </button>
        ))}
      </div>

      {/* dropzone */}
      <div
        onClick={() => !uploading && fileInput.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pickFile({ target: { files: e.dataTransfer.files } }); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInput.current?.click()}
        className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          file ? 'border-accent/50 bg-accent/5' : 'border-white/15 bg-white/[0.02] hover:border-accent/40'
        }`}
      >
        <input ref={fileInput} type="file" accept={type === 'video' ? 'video/*' : 'audio/*'} onChange={pickFile} className="hidden" />
        {file ? (
          <div className="flex items-center justify-center gap-3 text-sm text-white">
            {type === 'video' ? <FileVideo className="text-accent-soft" size={22} /> : <FileAudio className="text-accent-soft" size={22} />}
            <span className="max-w-[16rem] truncate font-medium">{file.name}</span>
            <span className="text-slate-500">({(file.size / 1048576).toFixed(1)} MB)</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              aria-label="Remove file"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X size={15} className="text-slate-400" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={30} className="mx-auto text-accent-soft" />
            <p className="mt-3 text-sm font-medium text-white">Drop {type === 'video' ? 'a video' : 'an MP3'} here, or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">Up to 500 MB</p>
          </>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={Input} aria-label="Title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className={`${Input} resize-none`} aria-label="Description" />

        {/* category picker / creator */}
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); if (e.target.value) setNewCategory(''); }}
            aria-label="Category"
            className={`${Input} [&>option]:bg-ink-800 ${!categoryId ? 'text-slate-500' : ''}`}
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input
            value={newCategory}
            onChange={(e) => { setNewCategory(e.target.value); if (e.target.value) setCategoryId(''); }}
            placeholder="...or create a new one"
            className={Input}
            aria-label="New category name"
          />
        </div>

        {/* optional thumbnail */}
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-accent/40">
            <ImagePlus size={16} className="text-accent-soft" />
            {thumbnail ? 'Change artwork' : type === 'video' ? 'Custom thumbnail (optional)' : 'Album artwork (optional)'}
            <input type="file" accept="image/*" onChange={pickThumb} className="hidden" />
          </label>
          {thumbPreview && <img src={thumbPreview} alt="thumbnail preview" className="h-14 w-24 rounded-lg border border-white/10 object-cover" />}
          {type === 'video' && !thumbnail && <span className="text-xs text-slate-500">A frame is auto-captured if you skip this.</span>}
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-slate-300">
          <button
            type="button"
            role="switch"
            aria-checked={downloadable}
            onClick={() => setDownloadable((d) => !d)}
            className={`relative h-6 w-11 rounded-full transition-colors ${downloadable ? 'bg-accent' : 'bg-white/15'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${downloadable ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          Allow downloads
        </label>
      </div>

      <motion.button
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
        type="submit"
        disabled={uploading}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-blue py-3.5 font-semibold text-white shadow-glow disabled:opacity-50"
      >
        <UploadCloud size={18} />
        {uploading ? 'Uploading to Cloudinary...' : `Publish ${type === 'video' ? 'video' : 'track'}`}
      </motion.button>
    </motion.form>
  );
}
