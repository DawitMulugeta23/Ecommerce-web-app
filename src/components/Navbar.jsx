import { LogOut, ShoppingCart, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  // በካርት ውስጥ ያሉ ጠቅላላ የእቃዎች ብዛት
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          MY<span className="text-gray-800">STORE</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
          
          {/* ካርት አይኮን */}
          <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-800 font-medium border-l pl-4">
                <User size={18} className="mr-1" />
                <span>{user.name}</span>
              </div>
              <button 
                onClick={() => dispatch(logout())}
                className="text-gray-500 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;