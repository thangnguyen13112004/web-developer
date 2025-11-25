import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const AdminHeader = () => {
    const [adminName, setAdminName] = useState('Admin');

    useEffect(() => {
        // Lấy tên admin từ localStorage hiển thị cho đẹp
        const userStr = localStorage.getItem('appUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            setAdminName(user.hoTen || user.username || 'Admin');
        }
    }, []);

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
            {/* Bên trái: Thanh tìm kiếm nhanh hoặc Breadcrumb */}
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-blue-600 md:hidden">
                    <Menu size={24} />
                </button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm nhanh..." 
                        className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-100 outline-none w-64 text-sm transition-all"
                    />
                </div>
            </div>

            {/* Bên phải: Thông báo & Profile */}
            <div className="flex items-center gap-6">
                {/* Nút thông báo */}
                <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Profile Admin */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-700">{adminName}</p>
                        <p className="text-xs text-gray-500">Quản trị viên</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white cursor-pointer hover:ring-blue-200 transition-all">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;