import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../features/cart/cartSlice';
import ProductDetail from '../pages/ProductDetails';
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 text-left">
        <h3 className="text-lg font-bold truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm">{product.category}</p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-blue-600">${product.price}</span>
          <button 
            onClick={() => dispatch(addToCart(product))}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
          <Link to={`/product/${product._id}` } className="bg-blue-600 text-white px-1 py-1 rounded hover:bg-blue-700" >detail</Link>
        </div>
        
      </div>
    </div>
  );
};

export default ProductCard;