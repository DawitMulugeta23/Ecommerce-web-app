// client/src/components/RelatedProducts.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import API from "../services/api";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items } = useSelector((state) => state.products);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;

      setLoading(true);
      try {
        // First try to get from Redux store
        const fromStore = items
          .filter((p) => p.category === category && p._id !== currentProductId)
          .slice(0, 4);

        if (fromStore.length >= 4) {
          setRelatedProducts(fromStore);
          setLoading(false);
          return;
        }

        // If not enough in store, fetch from API
        const { data } = await API.get(`/products?category=${category}`);
        const filtered = data
          .filter((p) => p._id !== currentProductId)
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        toast.error("Failed to load related products");
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId, items]);

  if (loading) {
    return (
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">
          Related Products
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
