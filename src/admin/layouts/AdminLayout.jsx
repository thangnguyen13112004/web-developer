import React from 'react';
import { Outlet, Link } from 'react-router-dom';
// Import đúng đường dẫn 2 file vừa tạo
import AdminSidebar from '../components/Sidebar'; 
import AdminHeader from '../components/AdminHeader';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar cố định bên trái */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader />

                {/* Nội dung chính thay đổi theo route (giống @yield('content')) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;