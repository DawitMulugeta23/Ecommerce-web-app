import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import Navbar from '../components/Navbar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("ምርቱን ማምጣት አልተቻለም", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center mt-20">በመጫን ላይ...</div>;
  if (!product) return <div className="text-center mt-20">ምርቱ አልተገኘም!</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* የምስል ክፍል */}
        <div className="md:w-1/2">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full rounded-2xl shadow-lg object-cover max-h-[500px]" 
          />
        </div>

        {/* የመረጃ ክፍል */}
        <div className="md:w-1/2 space-y-6">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold uppercase">
            {product.category}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-3xl text-blue-600 font-bold">${product.price}</p>
          <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
          
          <div className="pt-6 border-t border-gray-100">
            <p className={`font-medium mb-4 ${product.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.countInStock > 0 ? `በክምችት ላይ: ${product.countInStock} እቃ አለ` : 'አልቋል'}
            </p>
            
            <button 
              onClick={() => dispatch(addToCart(product))}
              disabled={product.countInStock === 0}
              className="w-full md:w-64 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:bg-gray-300"
            >
              ወደ ቅርጫት ጨምር
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;