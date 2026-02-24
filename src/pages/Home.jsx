import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../features/products/productSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const filteredProducts = user?.role === 'admin' 
  ? items 
  : items.filter(p => p.countInStock > 0);
// መጠናቸው ከ 0 በላይ የሆኑትን ብቻ ለይቶ ለማውጣት

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
    
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Products</h1>
        {status === 'loading' && <p>Loading products...</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      </main>
    </div>
  );
};

export default Home;