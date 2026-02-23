import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart'; // አዲሱ የካርት ገጽ
import AdminAddProduct from './pages/AdminAddProduct';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* አድሚን ብቻ የሚገቡበት */}
        <Route 
          path="/admin/add-product" 
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminAddProduct />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;