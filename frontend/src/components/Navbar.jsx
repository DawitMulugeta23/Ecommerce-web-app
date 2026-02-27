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

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setIsProfileOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        {/* Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden dark:text-white"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
          <Link
            to="/"
            className="text-2xl font-black text-blue-600 tracking-tighter"
          >
            MY<span className="text-gray-800 dark:text-white">STORE</span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-gray-600 dark:text-gray-300">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          <Link to="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:scale-110 transition"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <Link
              to="/cart"
              className="relative p-2 dark:text-white hover:text-blue-600 transition"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              {/* Profile Image Trigger (No Dropdown Icon) */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center focus:outline-none"
              >
                <img
                  src={user.profilePicture}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 hover:ring-4 ring-blue-100 dark:ring-blue-900/30 transition cursor-pointer"
                  alt="profile"
                />
              </button>

              {/* Logout Popup */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {user.name}
                      </p>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        to="/admin/add-product"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-sm font-semibold"
                      >
                        <PlusCircle size={18} /> Add Product
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-semibold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
