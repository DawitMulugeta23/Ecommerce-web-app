import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // አዲስ
import Cart from './pages/Cart';
import AdminAddProduct from './pages/AdminAddProduct';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* አድሚን ካልሆነ መግባት አይችልም */}
        <Route path="/admin/add-product" element={
          <ProtectedRoute isAdmin={true}>
            <AdminAddProduct />
          </ProtectedRoute>
        } />
        <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute isAdmin={true}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;