// client/src/components/ProductList.jsx
import { Filter, LayoutGrid, Package, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import ProductCard from "./ProductCard";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Other",
];

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, inStock, lowStock, outOfStock

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // For customers: only show products with stock > 0
  const visibleItems = isAdmin
    ? items
    : items.filter((p) => p.countInStock > 0);

  const filteredItems = visibleItems.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;

    // Stock filter (for admin only - customers already see only in-stock items)
    let matchesStock = true;
    if (isAdmin) {
      if (stockFilter === "inStock") {
        matchesStock = product.countInStock > 0;
      } else if (stockFilter === "lowStock") {
        matchesStock = product.countInStock > 0 && product.countInStock < 10;
      } else if (stockFilter === "outOfStock") {
        matchesStock = product.countInStock === 0;
      }
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate stock statistics
  const totalProducts = items.length;
  const visibleProducts = visibleItems.length;
  const inStockProducts = items.filter((p) => p.countInStock > 0).length;
  const lowStockProducts = items.filter(
    (p) => p.countInStock > 0 && p.countInStock < 10,
  ).length;
  const outOfStockProducts = items.filter((p) => p.countInStock === 0).length;

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* Sticky Header */}
      <div className="sticky top-20 z-40 w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <LayoutGrid
              className="text-blue-600 dark:text-blue-400"
              size={24}
            />
            <h2 className="font-black text-gray-800 dark:text-white text-xl tracking-tighter">
              ምርቶች
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ምርት ይፈልጉ..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Select */}
          <div className="relative w-full md:w-72">
            <Filter
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <select
              className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 dark:text-gray-200"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" className="dark:bg-gray-900">
                ሁሉም ካቴጎሪዎች
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          {/* Stock Filter - Only show for admin */}
          {isAdmin && (
            <div className="relative w-full md:w-56">
              <Package
                className="absolute left-4 top-3.5 text-gray-400"
                size={18}
              />
              <select
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 dark:text-gray-200"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all" className="dark:bg-gray-900">
                  ሁሉም ክምችት
                </option>
                <option value="inStock" className="dark:bg-gray-900">
                  በክምችት ያሉ (In Stock)
                </option>
                <option value="lowStock" className="dark:bg-gray-900">
                  አነስተኛ ክምችት (Low Stock)
                </option>
                <option value="outOfStock" className="dark:bg-gray-900">
                  የተጠናቀቀ (Out of Stock)
                </option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Stock Statistics Bar - Different for Admin vs Customer */}
        <div className="max-w-[1800px] mx-auto mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">
              {isAdmin ? "ሁሉም ምርቶች:" : "የተገኙ ምርቶች:"}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {isAdmin ? totalProducts : visibleProducts}
            </span>
          </div>

          {isAdmin ? (
            // Admin sees all stats
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-500 dark:text-gray-400">
                  በክምችት ያሉ:
                </span>
                <span className="font-bold text-green-600">
                  {inStockProducts}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="text-gray-500 dark:text-gray-400">
                  አነስተኛ ክምችት:
                </span>
                <span className="font-bold text-orange-600">
                  {lowStockProducts}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-500 dark:text-gray-400">
                  የተጠናቀቀ:
                </span>
                <span className="font-bold text-red-600">
                  {outOfStockProducts}
                </span>
              </div>
            </>
          ) : (
            // Customer sees simple availability
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-500 dark:text-gray-400">
                በክምችት ያሉ ምርቶች ብቻ ይታያሉ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-8">
        {status === "loading" ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-400 dark:text-gray-500 font-bold italic">
              {isAdmin ? "ምንም ምርት አልተገኘም!" : "አሁን ያለ ምርት የለም። በቅርቡ ይመለሱ!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
