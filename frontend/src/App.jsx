import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext"; // በትክክል መምጣቱን አረጋግጥ
import About from "./pages/About";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEditProduct from "./pages/AdminEditProduct";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import Success from "./pages/Success";

function App() {
  return (
    // 1. ThemeProvider መላውን አፕ መክበብ አለበት
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
          <Navbar />

          {/* 2. ዋናው የይዘት ክፍል */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* የተጠበቁ መንገዶች (Protected Routes) */}
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <div className="p-20 text-center text-2xl">የእርስዎ ትዕዛዞች</div>
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
                path="/success"
                element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                }
              />

              {/* የመግቢያ ክፍሎች */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />

              {/* የአድሚን ክፍሎች */}
              <Route
                path="/admin/edit-product/:id"
                element={<AdminEditProduct />}
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
                path="/admin"
                element={
                  <ProtectedRoute isAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
