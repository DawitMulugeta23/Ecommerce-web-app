import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const AdminAddProduct = () => {
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', category: '', countInStock: ''
  });
  const [image, setImage] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ምስል ስላለ የግዴታ FormData መጠቀም አለብን
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('countInStock', formData.countInStock);
    data.append('image', image); // የፋይል ዳታው

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post('http://localhost:5000/api/products', data, config);
      alert('ምርቱ በትክክል ተመዝግቧል!');
    } catch (err) {
      alert('ስህተት ተፈጥሯል: ' + err.response.data.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-5">አዲስ ምርት ጨምር</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Product Name" className="w-full border p-2" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        
        <input type="number" placeholder="Price" className="w-full border p-2" 
          onChange={(e) => setFormData({...formData, price: e.target.value})} required />
        
        <textarea placeholder="Description" className="w-full border p-2" 
          onChange={(e) => setFormData({...formData, description: e.target.value})} required />

        <input type="file" className="w-full" accept="image/*"
          onChange={(e) => setImage(e.target.files[0])} required />

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
          ምርት መዝግብ
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;