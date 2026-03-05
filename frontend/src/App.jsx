// client/src/App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import About from "./pages/About";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditProduct from "./pages/AdminEditProduct";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import Success from "./pages/Success";
import ZeroStockProducts from "./pages/ZeroStockProducts";

function App() {
  return (
    <ThemeProvider>
      <title>Ecommerce</title>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />

              {/* Protected Routes (User only) */}
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success/:id"
                element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/zero-stock"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <ZeroStockProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-product"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminAddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-product/:id"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminEditProduct />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
