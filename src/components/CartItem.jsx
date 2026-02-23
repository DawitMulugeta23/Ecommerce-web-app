import { Minus, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../features/cart/cartSlice';


const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const itemId = item._id || item.id;

  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded shadow-sm" />
        <div>
          <h3 className="font-bold text-gray-800 truncate w-32 md:w-48">{item.name}</h3>
          <p className="text-blue-600 font-semibold">${item.price}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* መቆጣጠሪያ - መጠኑን ለመጨመር እና ለመቀነስ */}
        <div className="flex items-center border rounded-lg bg-gray-50">
          <button 
            onClick={() => dispatch(updateQuantity({ id: itemId, amount: -1 }))}
            className="p-1 hover:bg-gray-200"
          >
            <Minus size={16} />
          </button>
          <span className="px-3 font-medium">{item.quantity}</span>
          <button 
            onClick={() => dispatch(updateQuantity({ id: itemId, amount: 1 }))}
            className="p-1 hover:bg-gray-200"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* ማጥፊያ */}
        <button 
          onClick={() => dispatch(removeFromCart(itemId))}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;