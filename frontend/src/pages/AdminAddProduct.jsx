import { useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import toast from 'react-hot-toast';

// 1. የሚመረጡ ካቴጎሪዎችን እዚህ ጋር ዘርዝር (Pre-defined categories)
const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Other"
];

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    name: '', 
    price: '', 
    description: '', 
    category: '', // መጀመሪያ ባዶ ይሆናል
    countInStock: 5 
  });

  const [image, setImage] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ካቴጎሪ ካልተመረጠ ለማስጠንቀቅ
    if (!formData.category) {
      return toast.error("እባክዎ ካቴጎሪ ይምረጡ!");
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', Number(formData.price));
    data.append('description', formData.description);
    data.append('category', formData.category);
    
    const stockValue = formData.countInStock === '' ? 5 : Number(formData.countInStock);
    data.append('countInStock', stockValue);
    data.append('image', image);

    const loadingToast = toast.loading("ምርቱ በመመዝገብ ላይ ነው...");
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      // ማሳሰቢያ፡ API.post ውስጥ ሙሉ URL ከመጻፍ '/products' ብቻ መጠቀም ይሻላል (BaseURL ካለህ)
      await API.post('/products', data, config); 
      
      toast.success('ምርቱ በትክክል ተመዝግቧል! 🎉', { id: loadingToast });
      setFormData({ name: '', price: '', description: '', category: '', countInStock: 5 });
      setImage(null);
    } catch (err) {
      toast.error('ስህተት፡ ' + (err.response?.data?.message || "መመዝገብ አልተቻለም"), { id: loadingToast });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-2xl rounded-3xl border border-gray-100">
      <h2 className="text-3xl font-black mb-8 text-gray-800 tracking-tighter">አዲስ ምርት መመዝገቢያ</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Product Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">የምርት ስም</label>
          <input type="text" placeholder="ምሳሌ፡ iPhone 15 Pro" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>

        {/* Price & Stock in one row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ዋጋ (ETB)</label>
            <input type="number" step="0.01" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ክምችት (Stock)</label>
            <input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
              value={formData.countInStock}
              onChange={(e) => setFormData({...formData, countInStock: e.target.value})} required />
          </div>
        </div>

        {/* 🟢 Category Selection (Dropdown) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ካቴጎሪ ይምረጡ</label>
          <select 
            className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition bg-gray-50 cursor-pointer"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          >
            <option value="">-- ካቴጎሪ ይምረጡ --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">መግለጫ (Description)</label>
          <textarea rows="3" placeholder="ስለ ምርቱ ዝርዝር መረጃ..." className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})} required />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">የምርት ፎቶ</label>
          <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
            accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          ምርት መዝግብ
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;