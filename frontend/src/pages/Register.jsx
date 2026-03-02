import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearError, registerUser } from "../features/auth/authSlice";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.name.trim()) {
      setValidationError("Name is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      if (result) {
        navigate("/");
      }
    } catch (err) {
      // Error is handled by the reducer
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100 dark:border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-600 dark:text-green-400">
          Register
        </h2>

        {/* Display both validation errors and Redux errors */}
        {(validationError || error) && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {validationError || error?.message || "ምዝገባው አልተሳካም!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setValidationError("");
              }}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setValidationError("");
              }}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password (min. 6 characters)"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors pr-12"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setValidationError("");
              }}
              required
              minLength="6"
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {formData.password && formData.password.length > 0 && (
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1 w-16 rounded-full ${
                    formData.password.length >= 6
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-xs ${
                    formData.password.length >= 6
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formData.password.length >= 6
                    ? "Strong password"
                    : `${6 - formData.password.length} more characters needed`}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 dark:bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 dark:hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md dark:shadow-lg"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
