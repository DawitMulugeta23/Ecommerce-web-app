const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h2 className="text-2xl font-bold text-blue-400 mb-4">MyStore</h2>
          <p className="text-gray-400 text-sm">ጥራት ያላቸውን ምርቶች በተመጣጣኝ ዋጋ የሚያገኙበት ብቸኛው ቦታ።</p>
        </div>
        <div>
          <h3 className="font-bold mb-4">ፈጣን ሊንኮች</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/cart" className="hover:text-white">Cart</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">ያግኙን</h3>
          <p className="text-gray-400 text-sm">ኢሜይል: dawitmulugetas27@gmail.com</p>
          <p className="text-gray-400 text-sm">ስልክ: +251 968 871 794</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} MyStore. All rights reserved to Dawit Mulugeta.
      </div>
    </footer>
  );
};

export default Footer;