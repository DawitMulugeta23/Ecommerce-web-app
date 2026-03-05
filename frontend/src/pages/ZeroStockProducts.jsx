// client/src/pages/ZeroStockProducts.jsx
import { Edit, Eye, Package, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts } from "../features/products/productSlice";
import API from "../services/api";

const ZeroStockProducts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchZeroStockProducts();
  }, []);

  const fetchZeroStockProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/products/admin/zero-stock");
      setProducts(data);
    } catch (err) {
      toast.error("Failed to fetch zero stock products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Removed unused 'currentStock' parameter
  const handleRestock = async (productId) => {
    const newStock = prompt("Enter new stock quantity:", "10");
    if (newStock === null) return;
    
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      setProcessingId(productId);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await API.put(
        `/products/${productId}`,
        { countInStock: stockValue },
        config
      );

      if (data) {
        toast.success(`Product restocked successfully! New stock: ${stockValue}`);
        // Remove from list since it's no longer zero stock
        setProducts(products.filter(p => p._id !== productId));
        // Also dispatch to Redux to update global state
        dispatch(fetchProducts());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restock product");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}"? This cannot be undone!`)) {
      return;
    }

    try {
      setProcessingId(productId);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await API.delete(`/products/${productId}/permanent`, config);
      
      toast.success("Product permanently deleted!");
      // Remove from list
      setProducts(products.filter(p => p._id !== productId));
      // Also dispatch to Redux to update global state
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Zero Stock Products
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Products that are out of stock and hidden from customers
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchZeroStockProducts}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-16 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-800">
            <Package className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600 mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">
              No zero stock products found!
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              All products have stock available.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Image
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Product
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Price
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="p-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-bold dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {product._id.slice(-8)}
                        </p>
                        {product.user && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Added by: {product.user.name || 'Unknown'}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {product.category}
                      </td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                        {product.price} ETB
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">
                          Out of Stock
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            title="View (Admin only)"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/edit-product/${product._id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleRestock(product._id)}
                            disabled={processingId === product._id}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition disabled:opacity-50"
                            title="Restock"
                          >
                            <RefreshCw size={18} className={processingId === product._id ? "animate-spin" : ""} />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(product._id, product.name)}
                            disabled={processingId === product._id}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                            title="Permanently Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZeroStockProducts;