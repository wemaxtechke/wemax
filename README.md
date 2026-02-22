# Wemax - Full-Stack MERN E-commerce Platform

A modern, full-featured e-commerce platform built with the MERN stack, featuring a dropshipping model for Electronics & Furniture retail.

## 🚀 Features

### Customer Features
- **Browse Products** - No login required to browse
- **Product & Package Listings** - Search, filter, and sort products
- **Shopping Cart** - Add products and packages to cart (login required)
- **Checkout & Orders** - Manual bank payment workflow
- **Wishlist** - Save favorite products
- **Real-time Chat** - Chat with admin support
- **Order Tracking** - Track order status
- **Dark/Light Theme** - Customizable theme with Wemax branding
- **Custom Cursor** - Animated cursor with theme variants

### Admin Features
- **Dashboard** - Analytics and overview
- **Product Management** - CRUD operations for products
- **Package Management** - Create and manage product bundles
- **Order Management** - Process orders and confirm payments
- **Shipping Rates** - Configure location-based shipping
- **Customer Chats** - Manage customer support chats
- **Analytics** - Revenue, orders, and customer insights

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** + **Mongoose** - Database
- **JWT** + **Google OAuth** - Authentication
- **Socket.io** - Real-time chat
- **Cloudinary** - Image storage
- **Multer** - File uploads

### Frontend
- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Icons** - Icon library
- **Vite** - Build tool

## 📁 Project Structure

```
wemax/
├── Back-End/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & validation middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.io handlers
│   ├── utils/           # Utility functions
│   └── server.js         # Server entry point
│
└── Front-End/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── redux/       # Redux store & slices
    │   ├── hooks/       # Custom hooks
    │   ├── utils/       # Utility functions
    │   ├── themes/      # Theme configurations
    │   └── layouts/     # Layout components
    └── public/          # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)
- Google OAuth credentials (optional, for Google Sign-In)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Back-End
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
BANK_PAYBILL_NUMBER=123456
BANK_ACCOUNT_NUMBER=WEMAX001
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Front-End
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Packages
- `GET /api/packages` - Get all packages (public)
- `GET /api/packages/:id` - Get package by ID (public)
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Cart
- `GET /api/cart` - Get cart (auth required)
- `POST /api/cart` - Add to cart (auth required)
- `PUT /api/cart/:itemId` - Update cart item (auth required)
- `DELETE /api/cart/:itemId` - Remove from cart (auth required)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders` - Get orders (auth required)
- `GET /api/orders/:id` - Get order by ID (auth required)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PATCH /api/orders/:id/payment-confirm` - Confirm payment (admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/product/:productId` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)

### Wishlist
- `GET /api/wishlist` - Get wishlist (auth required)
- `POST /api/wishlist` - Add to wishlist (auth required)
- `DELETE /api/wishlist/:productId` - Remove from wishlist (auth required)

### Shipping Rates
- `GET /api/shipping-rates/public` - Get public shipping rates
- `GET /api/shipping-rates` - Get all rates (admin)
- `POST /api/shipping-rates` - Create rate (admin)
- `PUT /api/shipping-rates/:id` - Update rate (admin)
- `DELETE /api/shipping-rates/:id` - Delete rate (admin)

### Chats
- `GET /api/chats` - Get all chats (admin)
- `GET /api/chats/me` - Get my chat (auth required)
- `GET /api/chats/:chatId/messages` - Get messages (auth required)
- `POST /api/chats/send` - Send message (auth required)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats (admin)

## 🎨 Theme Colors

The application uses a custom dark/light theme system based on the Wemax brand:

### Dark Theme
- Primary: `#0A6CFF` (Electric Blue)
- Background: `#0B1C2D` (Deep Tech)
- Surface: `#111212` (Dark Gray)
- Text: `#FFFFFF` (Pure White)

### Light Theme
- Primary: `#0A6CFF` (Electric Blue)
- Background: `#FFFFFF` (Pure White)
- Surface: `#FAFAFA`
- Text: `#0B1C2D` (Deep Tech)

## 🔐 User Roles

- **Customer** - Can browse, add to cart, place orders, chat
- **Admin** - Full access to dashboard and management features

## 💳 Payment System

The platform uses a manual bank payment workflow:
1. Customer places order
2. System displays bank Paybill number and account number
3. Customer uploads proof of payment (optional)
4. Admin manually confirms payment
5. Order status updates accordingly

## 📦 Product Categories

### Electronics
- Phones, TVs, Woofers, Sound Systems, Mixers, Speakers, Power Amplifiers, Generators, Streaming Equipment, Accessories

### Furniture
- Chairs, Beds, Mattresses, Sofa Sets, Compressed Sofas, Dining Sets, Coffee Tables, Wardrobes, Office Furniture

## 🚢 Shipping

- Shipping costs calculated based on location (city/region)
- Admin can configure shipping rates per location
- Free shipping toggle available per product/package
- Shipping cost displayed at checkout

## 📱 Responsive Design

The application is fully responsive and mobile-first, optimized for:
- Desktop (1400px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🛠️ Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📄 License

ISC

## 👥 Author

Wemax Tech Team

---

**Note**: Make sure to configure all environment variables before running the application. The application requires MongoDB, Cloudinary, and optionally Google OAuth credentials to function properly.
