import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });

    const handleCloseSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    return (
        <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
            <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
                <AdminHeader onMenuToggle={handleToggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
