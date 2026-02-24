const Checkout = () => {
  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">የመክፈያ ገጽ</h2>
      <form className="space-y-4">
        <input type="text" placeholder="ሙሉ ስም" className="w-full p-3 border rounded" required />
        <input type="text" placeholder="ስልክ ቁጥር" className="w-full p-3 border rounded" required />
        <textarea placeholder="የመላኪያ አድራሻ" className="w-full p-3 border rounded" rows="3" required></textarea>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm font-medium">ክፍያ በባንክ (CBE/Telebirr):</p>
          <p className="text-blue-600 font-bold">1000123456789</p>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
          ትዕዛዝ ይላኩ
        </button>
      </form>
    </div>
  );
};

export default Checkout;