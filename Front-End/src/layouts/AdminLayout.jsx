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
        <div className={`flex min-h-screen min-w-0 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
            <div className="ml-0 flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 md:ml-[260px]">
                <AdminHeader onMenuToggle={handleToggleSidebar} />
                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
