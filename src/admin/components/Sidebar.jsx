import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    FileText, 
    Settings, 
    LogOut,
    Pill,
    Warehouse
} from 'lucide-react';

const AdminSidebar = () => {
    // Danh sách menu
    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
        { path: '/admin/products', icon: <Pill size={20} />, label: 'Quản lý Thuốc' },
        { path: '/admin/warehouse', icon: <Warehouse size={20} />, label: 'Quản lý Kho Hàng' },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng' },
        { path: '/admin/customers', icon: <Users size={20} />, label: 'Khách hàng' },
        { path: '/admin/reports', icon: <FileText size={20} />, label: 'Báo cáo' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cấu hình' },
    ];

    const handleLogout = () => {
        // Xử lý đăng xuất (xóa token, redirect)
        localStorage.removeItem('authToken');
        localStorage.removeItem('appUser');
        window.location.href = '/';
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl transition-all duration-300">
            {/* Logo Admin */}
            <div className="h-16 flex items-center justify-center border-b border-slate-700">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    PHARMA ADMIN
                </h1>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'} // Chỉ active chính xác route /admin
                        className={({ isActive }) => `
                            flex items-center gap-3 px-6 py-3 transition-colors relative
                            ${isActive 
                                ? 'bg-blue-600 text-white border-r-4 border-cyan-400' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }
                        `}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-slate-700 bg-slate-950">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-4 py-2 rounded transition-colors hover:bg-slate-800"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;