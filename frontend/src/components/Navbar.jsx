import {
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  ShoppingCart,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logos from "../../public/Most-Successful-Ecommerce-Categories.jpg";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../features/auth/authSlice";
import { clearCart, fetchCart } from "../features/cart/cartSlice";
import "./logo.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Calculate cart count - this updates in real-time as items change
  const cartCount = items.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

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

          {/* 🔥 FIXED: Logo and text in flex row */}
          <Link to="/" className="flex items-center gap-2">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={logos}
              alt="MYSTORE"
            />
            <span className="text-2xl font-black text-blue-600 tracking-tighter">
              MY<span className="text-gray-800 dark:text-white">STORE</span>
            </span>
          </Link>
        </div>

        {/* Desktop Links - Products and Contact now visible only when logged in */}
        <div className="hidden md:flex items-center gap-8 font-bold text-gray-600 dark:text-gray-300">
          {user && (
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
          )}
          {/* Products - only visible when user is logged in */}
          {user && (
            <Link to="/products" className="hover:text-blue-600 transition">
              Products
            </Link>
          )}

          {/* My Orders - only visible when user is logged in (already had this condition) */}
          {user && (
            <Link to="/my-orders" className="hover:text-blue-600 transition">
              My Orders
            </Link>
          )}

          {/* Contact - only visible when user is logged in */}
          {user && (
            <Link to="/contact" className="hover:text-blue-600 transition">
              Contact
            </Link>
          )}
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:scale-110 transition"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart Icon with Count - Always visible for logged in users */}
          {user && (
            <Link
              to="/cart"
              className="relative p-2 dark:text-white hover:text-blue-600 transition"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Icon for guests - also shows count from localStorage */}
          {!user && (
            <Link
              to="/cart"
              className="relative p-2 dark:text-white hover:text-blue-600 transition"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              {/* Profile Image Trigger */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center focus:outline-none"
              >
                <img
                  src={
                    user.profilePicture ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&bold=true`
                  }
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 hover:ring-4 ring-blue-100 dark:ring-blue-900/30 transition cursor-pointer"
                  alt="profile"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-semibold"
                    >
                      <ShoppingCart size={18} /> My Orders
                    </Link>

                    {user.role === "admin" && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-sm font-semibold"
                        >
                          <PlusCircle size={18} /> Dashboard
                        </Link>
                        <Link
                          to="/admin/add-product"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-sm font-semibold"
                        >
                          <PlusCircle size={18} /> Add Product
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-semibold border-t dark:border-gray-700"
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

      {/* Mobile Menu - Updated with same visibility rules */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-4 px-4">
          <Link
            to="/"
            className="block py-2 font-bold dark:text-white"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>

          {/* Products in mobile menu - only when logged in */}
          {user && (
            <Link
              to="/products"
              className="block py-2 font-bold dark:text-white"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
          )}

          {/* Contact in mobile menu - only when logged in */}
          {user && (
            <Link
              to="/contact"
              className="block py-2 font-bold dark:text-white"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          )}

          {/* My Orders in mobile menu - only when logged in */}
          {user && (
            <Link
              to="/my-orders"
              className="block py-2 font-bold dark:text-white"
              onClick={() => setIsOpen(false)}
            >
              My Orders
            </Link>
          )}

          {/* Cart link in mobile menu with count - always visible */}
          <Link
            to="/cart"
            className="block py-2 font-bold dark:text-white flex items-center justify-between"
            onClick={() => setIsOpen(false)}
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
