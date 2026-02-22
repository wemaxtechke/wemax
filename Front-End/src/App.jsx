import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './redux/slices/authSlice.js';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Packages from './pages/Packages.jsx';
import PackageDetail from './pages/PackageDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import Wishlist from './pages/Wishlist.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import Shipping from './pages/Shipping.jsx';
import Returns from './pages/Returns.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminPackages from './pages/admin/AdminPackages.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminShippingRates from './pages/admin/AdminShippingRates.jsx';
import AdminChats from './pages/admin/AdminChats.jsx';
import AdminFlashSale from './pages/admin/AdminFlashSale.jsx';

function RequireAuth({ children }) {
    const { isAuthenticated = false, loading = false, token = null } = useSelector((state) => state?.auth || {});
    const location = useLocation();

    // While we have a token but haven't confirmed auth yet, avoid redirecting and show a loader
    if ((token && !isAuthenticated) || loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return isAuthenticated
        ? children
        : <Navigate to="/login" replace state={{ from: location }} />;
}

function RequireAdmin({ children }) {
    const { isAuthenticated = false, user = null, loading = false, token = null } = useSelector((state) => state?.auth || {});
    const location = useLocation();

    if ((token && !isAuthenticated) || loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

function App() {
    const dispatch = useDispatch();
    const { theme = 'light', cursorVisible = true } = useSelector((state) => state?.ui || {});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(getMe());
        }
    }, [dispatch]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeProvider>
            <Router>
                {cursorVisible && <CustomCursor />}
                <Routes>
                    {/* Public Storefront Routes */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/:id" element={<ProductDetail />} />
                        <Route path="packages" element={<Packages />} />
                        <Route path="packages/:id" element={<PackageDetail />} />
                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="shipping" element={<Shipping />} />
                        <Route path="returns" element={<Returns />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="auth/callback" element={<AuthCallback />} />
                        <Route
                            path="cart"
                            element={
                                <RequireAuth>
                                    <Cart />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="checkout"
                            element={
                                <RequireAuth>
                                    <Checkout />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="orders"
                            element={
                                <RequireAuth>
                                    <Orders />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="orders/:id/track"
                            element={
                                <RequireAuth>
                                    <OrderTracking />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="wishlist"
                            element={
                                <RequireAuth>
                                    <Wishlist />
                                </RequireAuth>
                            }
                        />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <RequireAdmin>
                                <AdminLayout />
                            </RequireAdmin>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="packages" element={<AdminPackages />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="shipping-rates" element={<AdminShippingRates />} />
                        <Route path="chats" element={<AdminChats />} />
                        <Route path="flash-sale" element={<AdminFlashSale />} />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
