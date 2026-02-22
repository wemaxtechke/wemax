import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ChatWidget from '../components/ChatWidget.jsx';

export default function MainLayout() {
    const location = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
