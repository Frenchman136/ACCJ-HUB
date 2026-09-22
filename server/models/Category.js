import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['video', 'music'], required: true },
    coverImage: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
