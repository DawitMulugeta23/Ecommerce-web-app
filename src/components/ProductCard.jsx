import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* የምስል ክፍል */}
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700">
          {product.category}
        </div>
      </div>

      {/* የመረጃ ክፍል */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-blue-600 font-extrabold text-xl mb-4">${product.price}</p>
        
        {/* አዝራሮች (ከታች እኩል እንዲሆኑ flex-col እና mt-auto እንጠቀማለን) */}
        <div className="mt-auto flex gap-2">
          {/* Detail View Button (Transparent) */}
          <Link 
            to={`/product/${product._id}`}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
          >
            <Eye size={16} /> ዝርዝር
          </Link>

          {/* Add to Cart Button (Transparent/Outline style) */}
          <button 
            onClick={() => dispatch(addToCart(product))}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-semibold"
          >
            <ShoppingCart size={16} /> ጨምር
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;