import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../features/products/productSlice';
import API from '../services/api';
import toast from 'react-hot-toast';
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('ይህ ምርት እንዲጠፋ ይፈልጋሉ?')) {
      try {
        // ቶከኑን ከ localStorage መውሰድ አለብን
        const token = localStorage.getItem('token'); 
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        await API.delete(`/products/${id}`, config);
        toast.success('ምርቱ በትክክል ጠፍቷል!');
        dispatch(fetchProducts()); 
      } catch (err) {
        toast.error('ማጥፋት አልተቻለም: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">የምርቶች ማስተዳደሪያ</h1>
        <Link to="/admin/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> አዲስ ምርት
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b">ምስል</th>
              <th className="p-4 border-b">ስም</th>
              <th className="p-4 border-b">ዋጋ</th>
              <th className="p-4 border-b">ካቴጎሪ</th>
              <th className="p-4 border-b">ድርጊት</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-4 border-b">
                  <img src={product.image} alt="" className="w-12 h-12 object-cover rounded" />
                </td>
                <td className="p-4 border-b font-medium">{product.name}</td>
                <td className="p-4 border-b">${product.price}</td>
                <td className="p-4 border-b">{product.category}</td>
                <td className="p-4 border-b space-x-3">
                  <button className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;