import {
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  ShoppingCart,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../features/auth/authSlice";
import { clearCart } from "../features/cart/cartSlice";

const ThemeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useTheme(); // ስሙ መስተካከል አለበት
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2 rounded-full transition-all duration-300 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:scale-110"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-950 shadow-sm sticky top-0 z-50 h-20 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 flex justify-between items-center h-full">
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-500 dark:text-gray-400"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <Link
            to="/"
            className="text-2xl md:text-3xl font-black text-blue-600 tracking-tighter"
          >
            MY
            <span className="text-gray-800 dark:text-white transition-colors">
              STORE
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-gray-600 dark:text-gray-300 font-semibold">
          <Link
            to="/"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Products
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Contact
          </Link>
        </div>

        {/* Right Side Section */}
        <div className="flex items-center space-x-3 md:space-x-6">
          <ThemeToggle />

          {user && user.role === "admin" && (
            <Link
              to="/admin/add-product"
              className="hidden sm:flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 dark:shadow-none"
            >
              <PlusCircle size={20} />
              <span className="text-sm">Add Product</span>
            </Link>
          )}

          {user && (
            <Link
              to="/cart"
              className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-950">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="group shrink-0">
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover group-hover:ring-4 ring-blue-100 dark:ring-blue-900 transition"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-950 z-40 md:hidden top-20 border-t border-gray-100 dark:border-gray-800 p-6 flex flex-col space-y-4 font-bold text-xl dark:text-white">
          <Link to="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/products" onClick={() => setIsOpen(false)}>
            Products
          </Link>
          {user && user.role === "admin" && (
            <Link
              to="/admin/add-product"
              className="text-orange-500"
              onClick={() => setIsOpen(false)}
            >
              + Add Product
            </Link>
          )}
          <button onClick={handleLogout} className="text-red-500 text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
