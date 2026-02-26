import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../features/cart/cartSlice';
import API from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Success = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  // Chapa ሲመልሰን በ URL ላይ የሚመጣውን መለያ ለማግኘት
  const tx_ref = searchParams.get('trx_id') || searchParams.get('tx_ref');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!tx_ref) {
        setStatus('error');
        return;
      }

      try {
        // ባክኤንድ ላይ የሰራነውን የ verify endpoint መጥራት
        const { data } = await API.get(`/payments/verify/${tx_ref}`);
        
        if (data.data.status === 'success') {
          setStatus('success');
          dispatch(clearCart()); // ክፍያው ስለተሳካ ካርቱን ባዶ አድርግ
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [tx_ref, dispatch]);

  // 1. በማረጋገጥ ላይ እያለ የሚታይ (Loading)
  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">ክፍያዎን በማረጋገጥ ላይ ነን...</h2>
        <p className="text-gray-500">እባክዎ ለጥቂት ሰከንዶች ይጠብቁ።</p>
      </div>
    );
  }

  // 2. ክፍያው ከተሳካ የሚታይ
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-black text-gray-900 mb-2 text-center">እንኳን ደስ አለዎት!</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          ክፍያዎ በተሳካ ሁኔታ ተፈጽሟል። ትዕዛዝዎ አሁን እየተዘጋጀ ነው።
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          ወደ ገበያ ተመለስ
        </Link>
      </div>
    );
  }

  // 3. ስህተት ከተፈጠረ የሚታይ
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">ክፍያው አልተረጋገጠም</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        ይቅርታ፣ የክፍያ መረጃውን ማረጋገጥ አልቻልንም። ችግር ካለ እባክዎ በ contact ገጻችን ያሳውቁን።
      </p>
      <div className="flex gap-4">
        <Link to="/checkout" className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold">እንደገና ሞክር</Link>
        <Link to="/contact" className="border-2 border-gray-300 px-8 py-3 rounded-xl font-bold">እገዛ ፈልግ</Link>
      </div>
    </div>
  );
};

export default Success;