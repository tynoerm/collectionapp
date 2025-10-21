import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/collectionapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// Import routes
import SignupRoute from './Routes/SignupRoute.js';
import LoginRoute from './Routes/LoginRoute.js';
import LoanRoute from './Routes/LoanRoute.js';
import LoanstatusRoute from './Routes/LoanstatusRoute.js';
import PaymentRoutes from './Routes/PaymentRoutes.js';

// Use routes
app.use('/api/signup', SignupRoute);
app.use('/api/login', LoginRoute);
app.use('/api/loans', LoanRoute);
app.use('/api/getstatusloans', LoanstatusRoute);
app.use('/api/loanstobepaid', PaymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend with MongoDB!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
