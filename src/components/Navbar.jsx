import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">MyStore</Link>
      
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="text-gray-700 relative font-medium">
           Cart {cartCount > 0 && <span className="bg-red-500 text-white rounded-full px-2 text-xs">{cartCount}</span>}
        </Link>
        
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin/add-product" className="text-orange-600 font-bold border-r pr-4">Admin Panel</Link>
            )}
            <span className="font-medium text-gray-800">ሰላም፣ {user.name}</span>
            <button onClick={() => dispatch(logout())} className="text-red-500 font-bold hover:underline">Logout</button>
          </>
        ) : (
          <div className="space-x-2">
            <Link to="/login" className="text-blue-600 font-medium">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded-md">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;