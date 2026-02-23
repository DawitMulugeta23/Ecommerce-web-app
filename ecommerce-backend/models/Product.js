import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String, required: true }, // የምስሉ ሊንክ
  category: { type: String, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // የትኛው አድሚን እንደጨመረው ለማወቅ
}, { timestamps: true });

export default mongoose.model('Product', productSchema);