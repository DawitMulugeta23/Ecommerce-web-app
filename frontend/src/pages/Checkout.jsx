// client/src/pages/Checkout.jsx
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import API from "../services/api";

const CHAPA_PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    description: "Pay with Visa, Mastercard, or other cards",
    fields: ["card_number", "card_holder", "expiry", "cvv"],
    demoData: {
      card_number: "4242 4242 4242 4242",
      card_holder: "John Doe",
      expiry: "12/25",
      cvv: "123",
    },
  },
  {
    id: "telebirr",
    name: "Telebirr",
    icon: "📱",
    description: "Pay with your Telebirr mobile money",
    fields: ["phone_number"],
    demoData: {
      phone_number: "0912345678",
    },
  },
  {
    id: "cbebirr",
    name: "CBE Birr",
    icon: "🏦",
    description: "Pay with your CBE Birr account",
    fields: ["account_number", "phone_number"],
    demoData: {
      account_number: "1000200030004000",
      phone_number: "0912345678",
    },
  },
  {
    id: "mpesa",
    name: "M-PESA",
    icon: "📲",
    description: "Pay with M-PESA mobile money",
    fields: ["phone_number"],
    demoData: {
      phone_number: "254712345678",
    },
  },
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState("chapa");
  const [selectedChapaMethod, setSelectedChapaMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",

    // Payment specific fields
    card_number: "",
    card_holder: "",
    expiry: "",
    cvv: "",
    account_number: "",
    phone_number: "",
  });

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fillDemoData = () => {
    const method = CHAPA_PAYMENT_METHODS.find(
      (m) => m.id === selectedChapaMethod,
    );
    if (method?.demoData) {
      setFormData({
        ...formData,
        ...method.demoData,
      });
      toast.success("Demo data filled!");
    }
  };

  const validateForm = () => {
    // Validate personal information
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }

    // Validate payment method specific fields
    const method = CHAPA_PAYMENT_METHODS.find(
      (m) => m.id === selectedChapaMethod,
    );
    if (method) {
      for (const field of method.fields) {
        if (!formData[field]?.trim()) {
          toast.error(`Please enter ${field.replace("_", " ")}`);
          return false;
        }
      }
    }

    return true;
  };

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

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const tx_ref = `tx-${Date.now()}`;

    try {
      const paymentData = {
        amount: checkoutTotal,
        email: formData.email,
        firstName: formData.fullName.split(" ")[0],
        lastName: formData.fullName.split(" ").slice(1).join(" ") || "Customer",
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        tx_ref,
        items: checkoutItems,
        payment_method: selectedChapaMethod,
        // Include payment method specific data
        payment_data: {
          ...(selectedChapaMethod === "card" && {
            card_number: formData.card_number,
            card_holder: formData.card_holder,
            expiry: formData.expiry,
            cvv: formData.cvv,
          }),
          ...(selectedChapaMethod === "telebirr" && {
            phone_number: formData.phone_number,
          }),
          ...(selectedChapaMethod === "cbebirr" && {
            account_number: formData.account_number,
            phone_number: formData.phone_number,
          }),
          ...(selectedChapaMethod === "mpesa" && {
            phone_number: formData.phone_number,
          }),
        },
      };

      const { data } = await API.post(
        "/payments/chapa/initialize",
        paymentData,
      );

      if (data.data?.checkout_url) {
        // Store order info in localStorage for reference
        localStorage.setItem(
          "lastOrder",
          JSON.stringify({
            orderId: data.orderId,
            tx_ref: tx_ref,
            amount: checkoutTotal,
          }),
        );

        // Redirect to Chapa payment page
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

  const renderPaymentFields = () => {
    const method = CHAPA_PAYMENT_METHODS.find(
      (m) => m.id === selectedChapaMethod,
    );
    if (!method) return null;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">
            {method.name} Payment Details
          </h3>
          <button
            type="button"
            onClick={fillDemoData}
            className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            <Info size={12} />
            Fill Demo Data
          </button>
        </div>

        {method.fields.includes("card_number") && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Card Number
            </label>
            <input
              type="text"
              name="card_number"
              placeholder="4242 4242 4242 4242"
              value={formData.card_number}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {method.fields.includes("card_holder") && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Card Holder Name
            </label>
            <input
              type="text"
              name="card_holder"
              placeholder="John Doe"
              value={formData.card_holder}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {method.fields.includes("expiry") && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}

        {method.fields.includes("phone_number") && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              placeholder="09xxxxxxxx"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {method.fields.includes("account_number") && (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              placeholder="Enter account number"
              value={formData.account_number}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {/* Demo Info Message */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          ℹ️ Click "Fill Demo Data" to use test credentials
        </p>
      </div>
    );
  };

  return (
    <div
      className={`max-w-6xl mx-auto p-6 md:p-10 ${isDarkMode ? "dark" : ""}`}
    >
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 text-center">
        Complete Your Order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Order items and forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Order Summary
              </h2>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="space-y-4">
              {checkoutItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex gap-4 border-b dark:border-gray-800 pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold dark:text-white">{item.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Quantity: {item.quantity} x {item.price} ETB
                    </p>
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {Number(item.price) * Number(item.quantity)} ETB
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4 text-xl font-black dark:text-white">
                <span>Total:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {checkoutTotal} ETB
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Customer Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Payment methods */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3 mb-6">
              <label className="flex items-center p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="chapa"
                  checked={selectedMethod === "chapa"}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <span className="font-bold dark:text-white">Chapa</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Multiple payment options via Chapa
                  </p>
                </div>
              </label>
            </div>

            {/* Chapa Payment Method Selection */}
            {selectedMethod === "chapa" && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Select Payment Method
                </h3>
                <div className="space-y-2">
                  {CHAPA_PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedChapaMethod === method.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="chapaMethod"
                        value={method.id}
                        checked={selectedChapaMethod === method.id}
                        onChange={(e) => setSelectedChapaMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{method.icon}</span>
                          <span className="font-bold dark:text-white">
                            {method.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Dynamic payment fields based on selected method */}
                {renderPaymentFields()}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || checkoutItems.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Pay ${checkoutTotal} ETB`}
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
              Your payment information is secure and encrypted
            </p>

            {/* Demo Mode Notice */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                🧪 Demo Mode - Use "Fill Demo Data" for test credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
