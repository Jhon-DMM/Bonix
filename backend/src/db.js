import mongoose from 'mongoose';

export async function conectarBaseDatos() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bonix';
  await mongoose.connect(uri);
  console.log('Conectado a MongoDB.');
}
