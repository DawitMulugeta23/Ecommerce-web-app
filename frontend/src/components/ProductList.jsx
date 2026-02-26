import { Filter, LayoutGrid, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/products/productSlice";
import ProductCard from "./ProductCard";

// 1. ለአድሚኑ የሰጠነው ዝርዝር እዚህም አንድ አይነት መሆን አለበት
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // 2. የማጣሪያ (Filter) ሎጂክ
  const filteredItems = items.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* 🟢 Sticky Header - Full Width */}
      <div className="sticky top-20 z-40 w-full bg-white shadow-sm border-b border-gray-100 px-4 md:px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <LayoutGrid className="text-blue-600" size={24} />
            <h2 className="font-black text-gray-800 text-xl tracking-tighter">
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
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 🔵 የተገደበ የካቴጎሪ ዝርዝር (Select Category) */}
          <div className="relative w-full md:w-72">
            <Filter
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <select
              className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">ሁሉም ካቴጎሪዎች</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom Arrow Icon */}
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
        </div>
      </div>

      {/* 🔵 Product Grid */}
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
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-xl text-gray-400 font-bold italic">
              በዚህ ካቴጎሪ ምንም ምርት አልተገኘም!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
