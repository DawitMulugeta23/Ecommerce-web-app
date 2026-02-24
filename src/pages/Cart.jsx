import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);

  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">የእርስዎ የገበያ ቅርጫት</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 text-xl mb-6">ቅርጫቱ ባዶ ነው!</p>
            <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition">
              ወደ ገበያ ተመለስ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* የእቃዎች ዝርዝር */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
              {items.map((item) => (
                <CartItem key={item._id || item.id} item={item} />
              ))}
            </div>

            {/* የክፍያ ማጠቃለያ */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">የክፍያ ማጠቃለያ</h2>
              <div className="flex justify-between text-lg mb-6">
                <span>ጠቅላላ ዋጋ:</span>
                <span className="text-green-600 font-bold">${totalAmount.toFixed(2)}</span>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                ክፍያ ፈጽም (Checkout)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;