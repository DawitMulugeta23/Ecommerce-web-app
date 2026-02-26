import { useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";

const Checkout = () => {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading, setLoading } = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const tx_ref = `tx-${Date.now()}`; // ለየክፍያው የተለየ መታወቂያ

    try {
      const paymentData = {
        amount: totalAmount,
        email: user.email,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "Customer",
        tx_ref,
      };

      const { data } = await API.post(
        "/payments/chapa/initialize",
        paymentData,
      );

      if (data.data && data.data.checkout_url) {
        // ተጠቃሚውን ወደ Chapa የክፍያ ገጽ መውሰጃ መስመር፡
        window.location.href = data.data.checkout_url;
      } else {
        alert("የክፍያ ሊንክ ማግኘት አልተቻለም!");
      }
    } catch (err) {
      console.error("Payment failed", err);
      alert(err.response?.data?.message || "ክፍያ መጀመር አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      {/* በ return ውስጥ items-ን እንዲህ ተጠቀምባቸው */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">የሚገዙ ዕቃዎች ዝርዝር፡</h3>
        {items.map((item) => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <span>
              {item.name} (x{item.quantity})
            </span>
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
