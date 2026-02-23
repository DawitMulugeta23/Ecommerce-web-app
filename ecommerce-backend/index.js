import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';


// 1. መጀመሪያ dotenv config ይደረግ (ከሌሎች ነገሮች በፊት)

const app = express();
dotenv.config();
// 2. አሁን dotenv ስለተጫነ connectDB መጥራት ይቻላል
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
// 3. ፖርቱንም እዚህ ጋር እናገኘዋለን
const PORT =process.env.PORT;

app.use('/api/auth',authRoutes)
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});