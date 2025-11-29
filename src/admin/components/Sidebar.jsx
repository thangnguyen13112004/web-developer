import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, FileText, Settings, LogOut, Pill, Warehouse, Database
} from 'lucide-react';

const AdminSidebar = () => {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('appUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role); // Lấy role: Admin, Manager, hoặc Staff
        }
    }, []);

    // Định nghĩa Menu đầy đủ
    const allMenuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng quan', roles: ['Admin', 'Manager', 'Staff'] },
        { path: '/admin/products', icon: <Pill size={20} />, label: 'Quản lý Thuốc', roles: ['Admin', 'Manager', 'Staff'] },
        { path: '/admin/warehouse/lots', icon: <Package size={20} />, label: 'Quản lý Lô', roles: ['Admin', 'Manager'] }, // Staff không xem lô
        { path: '/admin/warehouse/import', icon: <Warehouse size={20} />, label: 'Nhập Kho', roles: ['Admin', 'Manager'] },
        { 
            path: '/admin/warehouse/receipts', 
            icon: <FileText size={20} />, 
            label: 'Phiếu Nhập', 
            roles: ['Admin', 'Manager'] 
        },
        { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng', roles: ['Admin', 'Manager', 'Staff'] },
        { path: '/admin/customers', icon: <Users size={20} />, label: 'Nhân viên', roles: ['Admin', 'Manager'] }, // <--- CHỈ ADMIN/MANAGER THẤY
        { path: '/admin/reports', icon: <FileText size={20} />, label: 'Báo cáo', roles: ['Admin', 'Manager'] },
        // --- 2. THÊM MỤC SAO LƯU DỮ LIỆU (CHỈ ADMIN) ---
        { 
            path: '/admin/configuration/backup', 
            icon: <Database size={20} />, 
            label: 'Sao lưu & Phục hồi', 
            roles: ['Admin'] // Chỉ Admin mới được quyền đụng vào DB
        },
    ];

    // Lọc menu dựa trên Role hiện tại
    const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('appUser');
        window.location.href = '/';
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl transition-all duration-300">
            <div className="h-16 flex items-center justify-center border-b border-slate-700">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    PHARMA ADMIN
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin'}
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

            <div className="p-4 border-t border-slate-700 bg-slate-950">
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-4 py-2 rounded hover:bg-slate-800">
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;