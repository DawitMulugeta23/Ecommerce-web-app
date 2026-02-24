import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { clearCart } from '../features/cart/cartSlice';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo እና ዋና ሊንኮች */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
            MY<span className="text-gray-800">STORE</span>
          </Link>
          
          <div className="hidden md:flex space-x-6 text-gray-600 font-medium">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <Link to="/products" className="hover:text-blue-600 transition">Products</Link>
            <Link to="/about" className="hover:text-blue-600 transition">About</Link>
            <Link to="/contact" className="hover:text-blue-600 transition">Contact</Link>
          </div>
        </div>

        {/* የቀኝ በኩል አማራጮች (Cart, Orders, Auth) */}
        <div className="flex items-center space-x-5">
          {user && (
            <>
              {/* የትዕዛዝ ታሪክ (Orders) */}
              <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 flex items-center gap-1">
                <Package size={20} />
                <span className="hidden sm:inline">Orders</span>
              </Link>

              {/* የገበያ ቅርጫት (Cart) */}
              <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-800 font-semibold">
                <User size={18} className="text-blue-600" />
                <span className="text-sm">ሰላም, {user.name.split(' ')[0]}</span>
              </div>
              
              {user.role === 'admin' && (
                <Link to="/admin/add-product" className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-orange-200">
                  Admin
                </Link>
              )}
              
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;