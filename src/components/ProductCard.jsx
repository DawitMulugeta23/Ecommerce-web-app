import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../features/cart/cartSlice';
import { Eye, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state)=> state.cart.items);
  const itemInCart = cartItems.find((item) => (item._id || item.id) === product._id);
  const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;
  
  const isOutOfStock = product.countInStock <= 0;
  const isLimitReached = currentQtyInCart >=product.countInStock;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-blue-600 font-extrabold text-xl mb-1">${product.price}</p>
        <p className={`text-xs mb-4 ${isOutOfStock ? 'text-red-500' : 'text-gray-400'}`}>
          {isOutOfStock ? 'ተሽጦ አልቋል' : `ቀሪ በክምችት: ${product.countInStock}`}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-blue-600">${product.price}</span>
          <button 
            onClick={() => dispatch(addToCart(product))}
            disabled={isOutOfStock || isLimitReached} // ገደቡ ላይ ከደረሰ ይዘጋል
            className={`flex-1 flex items-center justify-center gap-2 border-2 py-2 rounded-xl text-sm font-semibold transition-colors
              ${isOutOfStock || isLimitReached 
                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
          >
            <ShoppingCart size={16} /> {isLimitReached ? 'ገደብ ላይ ነው' : 'ጨምር'}
          </button>
          <Link to={`/product/${product._id}` } className="bg-blue-600 text-white px-1 py-1 rounded hover:bg-blue-700" >detail</Link>
        </div>
        
      </div>
    </div>
  );
};

export default ProductCard;