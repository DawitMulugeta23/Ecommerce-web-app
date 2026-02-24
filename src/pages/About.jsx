const About = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-6">ስለ MYSTORE</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          እንኳን ወደ MYSTORE በደህና መጡ! እኛ ጥራት ያላቸውን ምርቶች በተመጣጣኝ ዋጋ ለደንበኞቻችን እናቀርባለን። 
          ከዘመናዊ ኤሌክትሮኒክስ እስከ ፋሽን ልብሶች ድረስ የሚፈልጉትን ሁሉ በአንድ ቦታ ያገኛሉ።
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-blue-50 rounded-2xl">
            <h3 className="font-bold text-blue-600 mb-2">ፈጣን አቅርቦት</h3>
            <p className="text-sm text-gray-500">ያዘዙትን እቃ ባሉበት ቦታ በፍጥነት እናደርሳለን።</p>
          </div>
          <div className="p-6 bg-green-50 rounded-2xl">
            <h3 className="font-bold text-green-600 mb-2">ታማኝነት</h3>
            <p className="text-sm text-gray-500">ጥራት ያላቸውን ኦሪጅናል ምርቶች ብቻ እናቀርባለን።</p>
          </div>
          <div className="p-6 bg-orange-50 rounded-2xl">
            <h3 className="font-bold text-orange-600 mb-2">24/7 ድጋፍ</h3>
            <p className="text-sm text-gray-500">ለማንኛውም ጥያቄ በየሰዓቱ ዝግጁ ነን።</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default About;