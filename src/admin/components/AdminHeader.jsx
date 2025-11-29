import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, AlertTriangle, X, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
    const [adminName, setAdminName] = useState('Admin');
    const [notifications, setNotifications] = useState([]);
    const [showNotiBox, setShowNotiBox] = useState(false);
    const [selectedLot, setSelectedLot] = useState(null); // State để hiện Modal chi tiết
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('appUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            setAdminName(user.hoTen || user.username || 'Admin');
        }
        fetchNotifications();
    }, []);

    // 1. Hàm kiểm tra hạn sử dụng (tái sử dụng logic)
    const checkStatus = (hsd) => {
        if (!hsd) return null;
        const today = new Date();
        const expDate = new Date(hsd);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Đã hết hạn', type: 'expired', days: Math.abs(diffDays) };
        if (diffDays < 90) return { label: 'Sắp hết hạn', type: 'warning', days: diffDays };
        return null; // Còn hạn tốt, không cần báo
    };

    // 2. Fetch dữ liệu lô để tạo thông báo
    const fetchNotifications = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        try {
            const res = await fetch('http://localhost:5223/api/admin/warehouse/lots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const lots = await res.json();
                const alerts = [];
                
                lots.forEach(lot => {
                    const status = checkStatus(lot.hsd);
                    if (status) {
                        alerts.push({
                            ...lot,
                            statusLabel: status.label,
                            statusType: status.type,
                            daysLeft: status.days
                        });
                    }
                });
                // Sắp xếp: Hết hạn lên trước
                alerts.sort((a, b) => (a.statusType === 'expired' ? -1 : 1));
                setNotifications(alerts);
            }
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        }
    };

    // Chuyển hướng đến trang quản lý lô khi click icon chuông
    const handleViewAll = () => {
        navigate('/admin/warehouse/lots');
        setShowNotiBox(false);
    };

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-20 sticky top-0">
            {/* Bên trái */}
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

            {/* Bên phải */}
            <div className="flex items-center gap-6">
                
                {/* --- PHẦN THÔNG BÁO (NOTIFICATION) --- */}
                <div 
                    className="relative group"
                    onMouseEnter={() => setShowNotiBox(true)}
                    onMouseLeave={() => setShowNotiBox(false)}
                >
                    <button 
                        className="relative text-gray-500 hover:text-blue-600 transition-colors pt-1"
                        onClick={handleViewAll}
                    >
                        <Bell size={22} />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                                {notifications.length > 99 ? '99+' : notifications.length}
                            </span>
                        )}
                    </button>

                    {/* --- DROPDOWN BOX --- */}
                    {showNotiBox && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-fadeIn origin-top-right">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-sm">Thông báo kho</h3>
                                <span className="text-xs text-gray-500">{notifications.length} tin mới</span>
                            </div>
                            
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        Kho hàng ổn định.<br/>Không có cảnh báo nào.
                                    </div>
                                ) : (
                                    notifications.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setSelectedLot(item)} // Click vào item -> Hiện Modal
                                            className="px-4 py-3 border-b hover:bg-blue-50 cursor-pointer transition-colors flex gap-3 items-start"
                                        >
                                            <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${item.statusType === 'expired' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <AlertTriangle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.tenThuoc}</p>
                                                <p className="text-xs text-gray-500 mb-1">Lô: <span className="font-mono text-blue-600">{item.soLo}</span></p>
                                                <p className={`text-xs font-medium ${item.statusType === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {item.statusType === 'expired' 
                                                        ? `Đã quá hạn ${item.daysLeft} ngày` 
                                                        : `Hết hạn sau ${item.daysLeft} ngày`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div 
                                onClick={handleViewAll}
                                className="text-center py-2 bg-gray-50 text-xs font-bold text-blue-600 hover:bg-gray-100 cursor-pointer border-t"
                            >
                                Xem tất cả danh sách lô
                            </div>
                        </div>
                    )}
                </div>

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

            {/* --- MODAL CHI TIẾT LÔ THUỐC (Khi click vào thông báo) --- */}
            {selectedLot && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
                    onClick={() => setSelectedLot(null)}
                >
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className={`p-4 text-white flex justify-between items-center ${selectedLot.statusType === 'expired' ? 'bg-red-600' : 'bg-orange-500'}`}>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <AlertTriangle size={20}/> Cảnh báo Lô hàng
                            </h3>
                            <button onClick={() => setSelectedLot(null)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="text-center mb-4">
                                <h4 className="text-xl font-bold text-gray-800">{selectedLot.tenThuoc}</h4>
                                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-blue-700 text-sm font-mono font-bold mt-1">
                                    Lô: {selectedLot.soLo}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-gray-500 flex items-center gap-1"><Calendar size={14}/> Ngày sản xuất</p>
                                    <p className="font-medium">{new Date(selectedLot.nsx).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 flex items-center gap-1"><Calendar size={14}/> Hạn sử dụng</p>
                                    <p className={`font-bold ${selectedLot.statusType === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {new Date(selectedLot.hsd).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 flex items-center gap-1"><Package size={14}/> Tồn kho</p>
                                    <p className="font-medium">{selectedLot.tonKhoHienTai}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500">Nhà cung cấp</p>
                                    <p className="font-medium truncate" title={selectedLot.tenNCC}>{selectedLot.tenNCC}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 italic border border-gray-200">
                                {selectedLot.statusType === 'expired' 
                                    ? "Sản phẩm này đã hết hạn sử dụng. Vui lòng kiểm tra và tiến hành hủy hoặc trả hàng ngay lập tức."
                                    : "Sản phẩm sắp hết hạn. Vui lòng ưu tiên bán hoặc có kế hoạch xử lý."
                                }
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setSelectedLot(null)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;