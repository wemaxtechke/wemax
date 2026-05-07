import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http';
import path from 'path';

import { connectDB } from './config/db.js';
import { ensureUploadsDir, getUploadsRoot } from './config/storage.js';
import { getProductSpecKeyColumnName } from './lib/productSpecColumn.js';
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
const allowedOrigins = [
    'https://www.wemax.co.ke',
    'https://wemax.co.ke',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.wemax.co.ke')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

const uploadsAbsolute = path.resolve(getUploadsRoot());
app.use('/uploads', express.static(uploadsAbsolute, { maxAge: '7d', fallthrough: true }));

// SEO-related constants
// Prefer explicit CLIENT_URL, but default to planned production domain
const PUBLIC_SITE_URL = process.env.CLIENT_URL || 'https://wemax.co.ke';

// Robots.txt for crawlers
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send([
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${PUBLIC_SITE_URL.replace(/\/+$/, '')}/sitemap.xml`,
        '',
    ].join('\n'));
});

// Basic sitemap.xml for primary public routes
app.get('/sitemap.xml', (req, res) => {
    const base = PUBLIC_SITE_URL.replace(/\/+$/, '');
    const urls = [
        '/',
        '/products',
        '/packages',
        '/about',
        '/contact',
        '/terms',
        '/privacy',
        '/shipping',
        '/returns',
    ];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((path) => {
            const loc = `${base}${path === '/' ? '' : path}`;
            return `  <url><loc>${loc}</loc></url>`;
        }),
        '</urlset>',
    ].join('\n');

    res.type('application/xml').send(xml);
});

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

connectDB()
    .then(() => ensureUploadsDir())
    .then(() =>
        getProductSpecKeyColumnName().then((col) => {
            console.log(`ProductSpec label column: ${col}`);
        }).catch((err) => console.warn('ProductSpec column detect skipped:', err.message))
    )
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📁 Local uploads: ${uploadsAbsolute} → /uploads/...`);
        });
    });

export { io };
