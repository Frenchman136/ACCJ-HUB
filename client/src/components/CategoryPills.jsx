import { motion } from 'framer-motion';

export default function CategoryPills({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {[{ _id: '', name: 'All' }, ...categories].map((c) => {
        const isActive = active === c._id;
        return (
          <button
            key={c._id || 'all'}
            onClick={() => onChange(c._id)}
            className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-accent-blue shadow-glow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">
              {c.name}
              {c.count !== undefined && c._id && (
                <span className={`ml-1.5 text-xs ${isActive ? 'text-white/75' : 'text-slate-600'}`}>
                  {c.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
