import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from './ProductCard';
import Navbar from './Navbar';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (status === 'loading') return <div className="text-center py-10 text-xl">ምርቶች በመጫን ላይ ናቸው...</div>;
  if (items.length === 0) return <div className="text-center py-10">ምንም ምርት የለም።</div>;

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-3 mt-8">
      {items.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
    </>
  );
};

export default ProductList;