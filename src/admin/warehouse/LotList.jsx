import React, { useEffect, useState } from 'react';
import { Search, Calendar, AlertTriangle, Package, Trash2 } from 'lucide-react';

const LotList = () => {
    const [lots, setLots] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, expired, near_expire

    // Hàm tải dữ liệu (được tách ra để gọi lại sau khi xóa)
    const fetchLots = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/warehouse/lots', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLots(data);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách lô:", err);
        }
    };

    useEffect(() => {
        fetchLots();
    }, []);

    // --- HÀM XÓA LÔ (MỚI) ---
    const handleDelete = async (id) => {
        if(!window.confirm("Cảnh báo: Xóa lô thuốc sẽ ảnh hưởng đến lịch sử nhập/xuất. Bạn có chắc chắn muốn xóa?")) return;

        const token = localStorage.getItem('authToken');
        try {
            // Giả định API xóa là DELETE /api/admin/warehouse/lots/{id}
            // Bạn cần đảm bảo Backend có API này
            const res = await fetch(`http://localhost:5223/api/admin/warehouse/lots/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(res.ok) {
                alert("Đã xóa lô thành công!");
                fetchLots(); // Tải lại danh sách
            } else {
                alert("Lỗi khi xóa (Có thể lô đang có tồn kho hoặc đã bán).");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    // Hàm kiểm tra hạn sử dụng
    const checkStatus = (hsd) => {
        if (!hsd) return { label: 'Không xác định', color: 'gray' };
        
        const today = new Date();
        const expDate = new Date(hsd);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Đã hết hạn', color: 'red', code: 'expired' };
        if (diffDays < 90) return { label: 'Sắp hết hạn (<3 tháng)', color: 'orange', code: 'near_expire' };
        return { label: 'Còn hạn', color: 'green', code: 'valid' };
    };

    // Lọc dữ liệu
    const filteredLots = lots.filter(lot => {
        const matchName = lot.tenThuoc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lot.soLo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const status = checkStatus(lot.hsd);
        const matchStatus = filterStatus === 'all' || 
                            (filterStatus === 'expired' && status.code === 'expired') ||
                            (filterStatus === 'near_expire' && status.code === 'near_expire');

        return matchName && matchStatus;
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="text-blue-600"/> Quản lý Lô Thuốc
                </h1>
                
                {/* Bộ lọc nhanh trạng thái */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1 rounded text-sm font-medium ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >Tất cả</button>
                    <button 
                        onClick={() => setFilterStatus('near_expire')}
                        className={`px-3 py-1 rounded text-sm font-medium ${filterStatus === 'near_expire' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
                    >Sắp hết hạn</button>
                    <button 
                        onClick={() => setFilterStatus('expired')}
                        className={`px-3 py-1 rounded text-sm font-medium ${filterStatus === 'expired' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}
                    >Đã hết hạn</button>
                </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="bg-white p-4 rounded shadow-sm flex items-center gap-2 border border-gray-200">
                <Search className="text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên thuốc hoặc số lô..." 
                    className="flex-1 outline-none text-gray-700"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên thuốc / Số lô</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nhà cung cấp</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Hạn sử dụng</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">SL Nhập</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Tồn kho</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Giá nhập</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLots.map((lot) => {
                            const status = checkStatus(lot.hsd);
                            return (
                                <tr key={lot.maLo} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{lot.tenThuoc}</div>
                                        <div className="text-sm text-blue-600 font-mono">Lô: {lot.soLo}</div>
                                        <div className="text-xs text-gray-400">Ngày nhập: {new Date(lot.ngayNhap).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {lot.tenNCC}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                        <div className="font-medium">{new Date(lot.hsd).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-xs text-gray-500">NSX: {new Date(lot.nsx).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                                        {lot.soLuongNhap.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold ${lot.tonKhoHienTai > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {lot.tonKhoHienTai.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        {lot.donGiaNhap.toLocaleString()} ₫
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                                            {status.code !== 'valid' && <AlertTriangle size={12} className="mr-1"/>}
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(lot.maLo)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                            title="Xóa lô này"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredLots.length === 0 && (
                            <tr><td colSpan="8" className="text-center py-8 text-gray-500">Không tìm thấy dữ liệu lô thuốc.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LotList;