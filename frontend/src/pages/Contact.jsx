// client/src/pages/Contact.jsx
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-12 text-gray-900 dark:text-white">
          ያግኙን
        </h1>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                ኢሜይል
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg break-all">
                info@mystore.com
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                24/7 ኢሜይል ድጋፍ
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                ስልክ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                +251 911 00 00 00
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                ሰኞ - ቅዳሜ: 8:00 - 20:00
              </p>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                አድራሻ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                መገናኛ፣ አዲስ አበባ
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                ኢትዮጵያ
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              የስራ ሰዓታችን
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  ሰኞ - አርብ
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  8:00 - 20:00
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  ቅዳሜ
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  8:00 - 18:00
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl md:col-span-2">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  እሁድ
                </span>
                <span className="text-gray-600 dark:text-gray-400">ዝግ ነው</span>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              ቦታችን
            </h2>
            <div className="bg-gray-200 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 font-bold">
                ካርታ እዚህ ላይ ይታያል
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
