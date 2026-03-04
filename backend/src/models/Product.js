import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: true, trim: true, index: true },
    sizes: { type: [sizeSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    qualityTag: {
      type: String,
      enum: ['1:1', 'Dot Perfect', 'High-End', 'Premium Plus Batch'],
      required: true
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
