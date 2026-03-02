import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import commentRoutes from './routes/commentRoutes.js';
import analyticsRoutes from "./routes/analyticsRoutes.js"

const app = express();

// Connect to Database
connectDB();

// ✅ CORS - This alone handles OPTIONS preflight requests automatically
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5081",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(null, false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

// ⚠️ DO NOT ADD: app.options('*', cors()) - This causes the error!
// Express + cors middleware handles OPTIONS automatically

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Accepting requests from: http://localhost:5173`);
});
