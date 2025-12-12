import React, { useEffect, useState } from 'react';
import { 
    Search, Eye, Filter, MoreHorizontal, 
    CheckCircle, Truck, Package, XCircle, Clock, CreditCard, Trash2
} from 'lucide-react';

// 1. Import Modal
import OrderDetailModal from './OrderDetailModal';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    // 2. Thêm state quản lý modal
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Hàm xóa đơn hàng
    const handleDeleteOrder = async (id) => {
        if (!window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn đơn hàng và hoàn lại kho (nếu chưa hủy). Bạn có chắc chắn không?")) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/orders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa đơn hàng.");
                fetchOrders();
            } else {
                const err = await res.json();
                alert("Lỗi: " + err.message);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server");
        }
    };

    // Các trạng thái nghiệp vụ
    const STATUS_TABS = [
        'Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đã đóng gói', 'Đang giao', 'Hoàn tất', 'Đã hủy'
    ];

    // Mapping màu sắc cho badge
    const getStatusColor = (status) => {
        switch (status) {
            case 'Chờ xử lý': return 'bg-gray-100 text-gray-600';
            case 'Đang xử lý': return 'bg-blue-100 text-blue-600';
            case 'Đã đóng gói': return 'bg-indigo-100 text-indigo-600';
            case 'Đang giao': return 'bg-yellow-100 text-yellow-700';
            case 'Hoàn tất': return 'bg-green-100 text-green-700';
            case 'Đã hủy': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Đang giao': return <Truck size={14} className="mr-1"/>;
            case 'Đã đóng gói': return <Package size={14} className="mr-1"/>;
            case 'Hoàn tất': return <CheckCircle size={14} className="mr-1"/>;
            case 'Đã hủy': return <XCircle size={14} className="mr-1"/>;
            default: return <Clock size={14} className="mr-1"/>;
        }
    };

    // Load dữ liệu
    const fetchOrders = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Xử lý cập nhật trạng thái
    const handleUpdateStatus = async (id, newStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái sang "${newStatus}"?`)) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ trangThaiMoi: newStatus })
            });

            if (res.ok) {
                alert("Cập nhật thành công!");
                fetchOrders(); // Reload lại bảng
            } else {
                const err = await res.json();
                alert("Lỗi: " + err.message);
            }
        } catch (error) {
            console.error("Lỗi API cập nhật đơn hàng:", error);
            alert("Lỗi kết nối");
        }
    };

    // Filter logic
    const filteredOrders = orders.filter(order => {
        const matchTab = filterStatus === 'Tất cả' || order.trangThaiDH === filterStatus;
        const matchSearch = order.tenKhachHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.maDH.toString().includes(searchTerm);
        return matchTab && matchSearch;
    });

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý các đơn đặt hàng từ khách</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Tìm mã đơn, tên khách..." 
                        className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                </div>
            </div>

            {/* --- STATUS TABS --- */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-200">
                {STATUS_TABS.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-t-lg transition-colors ${
                            filterStatus === status 
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mã ĐH</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Thanh toán</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-8">Đang tải dữ liệu...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-8 text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.maDH} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">
                                        #{order.maDH}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{order.tenKhachHang}</div>
                                        <div className="text-xs text-gray-500">{order.sdt}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.ngayDat).toLocaleDateString('vi-VN')}
                                        <br/>
                                        <span className="text-xs">{new Date(order.ngayDat).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                        {order.tongTien.toLocaleString()} đ
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                            order.trangThaiTT === 'Đã thanh toán' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {order.trangThaiTT}
                                        </span>
                                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <CreditCard size={10}/> {order.phuongThucTT}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.trangThaiDH)}`}>
                                            {getStatusIcon(order.trangThaiDH)}
                                            {order.trangThaiDH}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="group relative inline-block">
                                            <button className="text-gray-400 hover:text-blue-600 p-1">
                                                <MoreHorizontal size={20}/>
                                            </button>
                                            
                                            {/* Dropdown Menu Thao tác nhanh */}
                                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg hidden group-hover:block z-50 text-left">
                                                <div className="py-1">
                                                    <button 
                                                        onClick={() => setSelectedOrderId(order.maDH)} // <--- THÊM SỰ KIỆN NÀY
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                    >
                                                        <Eye size={14}/> Xem chi tiết
                                                    </button>
                                                    <div className="border-t my-1"></div>
                                                    <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase">Cập nhật trạng thái</p>
                                                    
                                                    {['Đang xử lý', 'Đã đóng gói', 'Đang giao', 'Hoàn tất'].map(st => (
                                                        <button 
                                                            key={st}
                                                            onClick={() => handleUpdateStatus(order.maDH, st)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                                                        >
                                                            {st}
                                                        </button>
                                                    ))}
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.maDH, 'Đã hủy')}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        Hủy đơn hàng
                                                    </button>

                                                    {/* NÚT XÓA VĨNH VIỄN */}
                                                    <div className="border-t my-1"></div>
                                                    <button 
                                                        onClick={() => handleDeleteOrder(order.maDH)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14}/> Xóa vĩnh viễn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 4. Render Modal ở cuối file (ngoài bảng) */}
            {selectedOrderId && (
                <OrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                />
            )}
        </div>
    );
};

export default OrderList;