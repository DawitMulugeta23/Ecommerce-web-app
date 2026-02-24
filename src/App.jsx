import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Register from './pages/Register'; // አዲስ

function App() {
  return (
    <>
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
    <Footer/>
</>
  );
}

export default App;