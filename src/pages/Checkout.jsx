import { useSelector } from 'react-redux';
import API from '../services/api';

const Checkout = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const handlePayment = async () => {
    // ቼክ፡ ተጠቃሚው መግባቱን አረጋግጥ
    if (!user) {
      alert("እባክዎ መጀመሪያ ይግቡ");
      return;
    }

    try {
      console.log("ክፍያ እየተጀመረ ነው...");
      
      const { data } = await API.post('/payments/initialize', {
        amount: totalAmount,
        email: user.email,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || 'User',
      });

      console.log("ከChapa የመጣ ምላሽ:", data);

      if (data.status === 'success' && data.data.checkout_url) {
        // 🚀 በቀጥታ ወደ Chapa ክፍያ ገጽ ይወስደሃል
        window.location.href = data.data.checkout_url;
      } else {
        alert("የክፍያ ሊንክ መፍጠር አልተቻለም።");
      }
    } catch (err) {
      console.error("Payment Error:", err.response?.data || err.message);
      alert("ክፍያ ማስጀመር አልተቻለም። ሰርቨርህ መከፈቱን አረጋግጥ።");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      {/* በ return ውስጥ items-ን እንዲህ ተጠቀምባቸው */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">የሚገዙ ዕቃዎች ዝርዝር፡</h3>
        {items.map((item) => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <span>{item.name} (x{item.quantity})</span>
            <span>{item.price * item.quantity} ETB</span>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-6">ትዕዛዝዎን ያጠናቅቁ</h2>
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex justify-between mb-6 text-xl">
          <span className="text-gray-600">ጠቅላላ ድምር:</span>
          <span className="font-black text-blue-600">{totalAmount} ETB</span>
        </div>
        
        <button 
          onClick={handlePayment}
          className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-white py-4 rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg"
        >
          በ Chapa ክፍያ ፈጽም
        </button>
      </div>
    </div>
  );
};

export default Checkout;