import { useSelector } from 'react-redux';
import API from '../services/api';

const Checkout = () => {
  // አሁን items-ን ለዕይታ እንጠቀምባቸዋለን
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const handlePayment = async () => {
    console.log("ክፍያ እየተጀመረ ነው..."); // 👈 ቼክ ማድረጊያ
    try {
      const { data } = await API.post('/payments/initialize', {
        amount: totalAmount,
        email: user.email,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || 'User',
        phone: "0911000000" 
      });
  
      console.log("ከChapa የመጣ ምላሽ:", data); // 👈 ቼክ ማድረጊያ
  
      if (data.status === 'success' && data.data.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        alert("Chapa የክፍያ ሊንክ አልላከም!");
      }
    } catch (err) {
      console.error("የክፍያ ስህተት:", err.response?.data || err.message);
      alert("ክፍያ ማስጀመር አልተቻለም። ሰርቨሩ እየሰራ መሆኑን አረጋግጥ።");
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-black mb-8 text-center text-gray-900">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* የዕቃዎች ዝርዝር - እዚህ ጋር ነው items-ን የምናነበው */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">ትዕዛዞችዎ</h2>
          {items.map((item) => (
            <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">ብዛት: {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold text-blue-600">${item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        {/* የክፍያ ማጠቃለያ */}
        <div className="bg-gray-900 text-white p-8 rounded-3xl h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6">የክፍያ ማጠቃለያ</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-400">
              <span>ንዑስ ድምር</span>
              <span>{totalAmount} ETB</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>የማድረሻ ክፍያ</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="border-t border-gray-700 pt-4 flex justify-between text-xl font-black">
              <span>ጠቅላላ ድምር</span>
              <span className="text-blue-400">{totalAmount} ETB</span>
            </div>
          </div>
          
          <button 
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20"
          >
             በChapa ክፍያ ፈጽም
          </button>
          <p className="text-center text-xs text-gray-500 mt-4">Secure payment powered by Chapa</p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;