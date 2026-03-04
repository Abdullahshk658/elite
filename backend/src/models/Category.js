import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String, default: '' },
    level: { type: Number, default: 0, min: 0, max: 2 }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
