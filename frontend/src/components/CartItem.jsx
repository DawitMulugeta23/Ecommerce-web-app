// client/src/components/CartItem.jsx
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCartBackend,
  removeFromCartLocal,
  updateCartItemBackend,
  updateQuantityLocal,
} from "../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const itemId = item._id || item.id;

  const handleUpdateQuantity = async (amount) => {
    const newQuantity = item.quantity + amount;

    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    if (newQuantity > item.countInStock) {
      toast.error(`Only ${item.countInStock} items available in stock!`);
      return;
    }

    if (user) {
      try {
        await dispatch(
          updateCartItemBackend({
            id: itemId,
            quantity: newQuantity,
          }),
        ).unwrap();
      } catch (err) {
        toast.error(err.message || "Failed to update quantity");
      }
    } else {
      dispatch(updateQuantityLocal({ id: itemId, amount }));
    }
  };

  const handleRemove = async () => {
    if (user) {
      try {
        await dispatch(removeFromCartBackend(itemId)).unwrap();
        toast.success("Removed from cart");
      } catch (err) {
        toast.error(err.message || "Failed to remove item");
      }
    } else {
      dispatch(removeFromCartLocal(itemId));
      toast.success("Removed from cart");
    }
  };

  return (
    <div className="flex items-center justify-between border-b dark:border-gray-700 py-4">
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="h-20 w-20 object-cover rounded shadow-sm"
        />
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white truncate w-32 md:w-48">
            {item.name}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            {item.price} ETB
          </p>

          {/* Stock information in cart */}
          <div className="flex items-center gap-1 mt-1">
            <Package size={14} className="text-gray-400" />
            <span
              className={`text-xs ${
                item.countInStock < 5
                  ? "text-orange-500 font-bold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Available: {item.countInStock}
            </span>
          </div>

          {item.countInStock < 5 && (
            <p className="text-xs text-orange-500 font-bold animate-pulse">
              Only {item.countInStock} left in stock!
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => handleUpdateQuantity(-1)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-lg"
            disabled={item.quantity <= 1}
          >
            <Minus
              size={16}
              className={
                item.quantity <= 1 ? "text-gray-300" : "dark:text-white"
              }
            />
          </button>

          <span className="px-3 font-medium dark:text-white">
            {item.quantity}
          </span>

          <button
            onClick={() => handleUpdateQuantity(1)}
            disabled={item.quantity >= item.countInStock}
            className={`p-1 rounded-r-lg ${
              item.quantity >= item.countInStock
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Plus
              size={16}
              className={
                item.quantity >= item.countInStock
                  ? "text-gray-300"
                  : "dark:text-white"
              }
            />
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
          title="Remove from cart"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
