const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-center mb-12">ያግኙን</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* መረጃ መቀበያ ፎርም */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <form className="space-y-4">
            <input type="text" placeholder="ሙሉ ስም" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="email" placeholder="ኢሜይል" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
            <textarea placeholder="መልዕክትዎ..." rows="5" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"></textarea>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">መልዕክት ላክ</button>
          </form>
        </div>

        {/* አድራሻ መረጃ */}
        <div className="space-y-8 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">አድራሻ</h3>
            <p className="text-gray-600">አዲስ አበባ፣ ኢትዮጵያ (መገናኛ)</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">ስልክ</h3>
            <p className="text-gray-600">+251 911 00 00 00</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">ኢሜይል</h3>
            <p className="text-gray-600">info@mystore.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;