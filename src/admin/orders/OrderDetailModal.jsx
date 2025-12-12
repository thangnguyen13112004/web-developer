import React, { useEffect, useState } from 'react';
import { X, User, MapPin, CreditCard, Package } from 'lucide-react';

const OrderDetailModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        const fetchDetail = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(`http://localhost:5223/api/admin/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    alert("Không tải được chi tiết đơn hàng");
                    onClose();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{orderId}</h2>
                        <p className="text-sm text-gray-500">
                            Ngày đặt: {order ? new Date(order.ngayDat).toLocaleString('vi-VN') : '...'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1">
                    {loading ? (
                        <div className="text-center py-10">Đang tải dữ liệu...</div>
                    ) : order ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cột Trái: Thông tin chung */}
                            <div className="space-y-6">
                                {/* Khách hàng */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                                        <User size={18}/> Khách hàng
                                    </h3>
                                    <p><strong>Họ tên:</strong> {order.tenKhachHang}</p>
                                    <p><strong>SĐT:</strong> {order.sdt}</p>
                                </div>

                                {/* Giao hàng */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                                        <MapPin size={18}/> Địa chỉ nhận hàng
                                    </h3>
                                    <p><strong>Người nhận:</strong> {order.nguoiNhan}</p>
                                    <p><strong>SĐT nhận:</strong> {order.sdtNhan}</p>
                                    <p className="mt-1 text-sm text-gray-600">{order.diaChiGiao}</p>
                                </div>

                                {/* Thanh toán */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                                        <CreditCard size={18}/> Thanh toán
                                    </h3>
                                    <p><strong>Phương thức:</strong> {order.phuongThucTT}</p>
                                    <p><strong>Trạng thái:</strong> {order.trangThaiTT}</p>
                                    <p className="mt-2 text-xl font-bold text-red-600">
                                        Tổng tiền: {order.tongTien.toLocaleString()} đ
                                    </p>
                                </div>
                            </div>

                            {/* Cột Phải: Danh sách sản phẩm */}
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Package size={18}/> Danh sách sản phẩm ({order.items.length})
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-3 text-left">Sản phẩm</th>
                                                <th className="p-3 text-center">SL</th>
                                                <th className="p-3 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {order.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-3">
                                                        <div className="flex gap-3">
                                                            <img 
                                                                src={item.hinhAnh || 'https://placehold.co/50'} 
                                                                alt="" 
                                                                className="w-12 h-12 object-cover rounded border"
                                                            />
                                                            <div>
                                                                <p className="font-medium text-gray-900 line-clamp-2">{item.tenThuoc}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Lô: {item.soLo} | HSD: {item.hanSuDung ? new Date(item.hanSuDung).toLocaleDateString() : 'N/A'}
                                                                </p>
                                                                <p className="text-xs text-blue-600">{item.donGia.toLocaleString()} đ / {item.donViTinh}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center font-bold">x{item.soLuong}</td>
                                                    <td className="p-3 text-right font-medium">
                                                        {item.thanhTien.toLocaleString()} đ
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-red-500">Không tìm thấy dữ liệu.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;