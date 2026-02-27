import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';

// Initialize Cloudinary after loading environment
import { initializeCloudinary } from './config/cloudinary.js';
initializeCloudinary();

import { connectDB } from './config/db.js';
import passport from './config/passport.js';
import { initializeSocket } from './config/socket.js';
import { setupChatSocket } from './sockets/chatSocket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import flashSaleRoutes from './routes/flashSaleRoutes.js';
import testRoutes from './routes/testRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);
setupChatSocket(io);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shipping-rates', shippingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/flash-sale', flashSaleRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Wemax API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

export { io };
