import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const PAYMENT_METHODS = [
  {
    id: "chapa",
    name: "Chapa",
    icon: "💳",
    description: "Pay with Card, Telebirr, CBE Birr",
  },
  {
    id: "telebirr",
    name: "Telebirr",
    icon: "📱",
    description: "Pay directly with Telebirr",
  },
  {
    id: "cbebirr",
    name: "CBE Birr",
    icon: "🏦",
    description: "Pay with CBE Birr",
  },
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [selectedMethod, setSelectedMethod] = useState("chapa");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [account, setAccount] = useState("");

  // Handle direct buy from product card
  const checkoutItems = location.state?.directBuy
    ? [{ ...location.state.product, quantity: location.state.quantity }]
    : items;

  const checkoutTotal = location.state?.directBuy
    ? location.state.product.price * location.state.quantity
    : checkoutItems.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0,
      );

  const totalItems = checkoutItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("No items to checkout!");
      return;
    }

    // Validate required fields
    if (selectedMethod === "telebirr" && !phone) {
      toast.error("Please enter your Telebirr phone number");
      return;
    }
    if (selectedMethod === "cbebirr" && !account) {
      toast.error("Please enter your CBE Birr account");
      return;
    }

    setLoading(true);
    const tx_ref = `tx-${Date.now()}`;

    try {
      const paymentData = {
        amount: checkoutTotal,
        email: user.email,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "Customer",
        tx_ref,
        items: checkoutItems,
        ...(selectedMethod === "telebirr" && { phone }),
        ...(selectedMethod === "cbebirr" && { account }),
      };

      let endpoint = "";
      switch (selectedMethod) {
        case "chapa":
          endpoint = "/payments/chapa/initialize";
          break;
        case "telebirr":
          endpoint = "/payments/telebirr/initialize";
          break;
        case "cbebirr":
          endpoint = "/payments/cbebirr/initialize";
          break;
        default:
          endpoint = "/payments/chapa/initialize";
      }

      const { data } = await API.post(endpoint, paymentData);

      if (data.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.success("Order placed successfully!");
        navigate(`/order-success/${data.orderId}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">
        Complete Your Order
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left side - Order items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Order Summary
              </h2>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="space-y-4">
              {checkoutItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex gap-4 border-b pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity} x {item.price} ETB
                    </p>
                  </div>
                  <div className="font-bold text-blue-600">
                    {Number(item.price) * Number(item.quantity)} ETB
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4 text-xl font-black">
                <span>Total:</span>
                <span className="text-blue-600">{checkoutTotal} ETB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Payment methods */}
        <div className="space-y-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Payment Method
            </h2>

            <div className="space-y-3 mb-6">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-bold">{method.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {method.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional fields */}
            {selectedMethod === "telebirr" && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">
                  Telebirr Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            )}

            {selectedMethod === "cbebirr" && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">
                  CBE Birr Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your CBE Birr account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || checkoutItems.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Pay ${checkoutTotal} ETB`}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Your payment information is secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
