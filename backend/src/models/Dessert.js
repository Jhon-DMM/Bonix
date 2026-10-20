import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const colorsSchema = new mongoose.Schema(
  {
    from: { type: String, default: '#49bfff' },
    to: { type: String, default: '#d9f1ff' },
    accent: { type: String, default: '#0e82d1' },
    text: { type: String, default: '#10568a' },
  },
  { _id: false }
);

const dessertSchema = new mongoose.Schema(
  {
    // Slug legible usado por el frontend (anclas de sección, item del
    // carrito, etc). Distinto del _id interno de Mongo.
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    colors: { type: colorsSchema, default: () => ({}) },
    ingredients: { type: [ingredientSchema], default: [] },
  },
  { timestamps: true }
);

// El orden de aparición en el hero y en las secciones sigue el orden de
// creación (createdAt), así que no hace falta mantener un contador aparte.
dessertSchema.index({ createdAt: 1 });

export default mongoose.model('Dessert', dessertSchema);
