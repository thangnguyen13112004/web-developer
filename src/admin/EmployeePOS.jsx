// src/pages/admin/EmployeePOS.jsx
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, X, Package, Trash2 } from 'lucide-react';

const EmployeePOS = () => {
    // 1. SỬA LỖI CÚ PHÁP: Bỏ chữ 'initialState:'
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]); // <-- Đã sửa đúng

    // State xử lý chọn lô
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [availableLots, setAvailableLots] = useState([]);
    const [showLotModal, setShowLotModal] = useState(false);

    // 2. Load danh sách thuốc & Giỏ hàng khi vào trang
    useEffect(() => {
        loadData();
        fetchCart(); // Gọi hàm tải giỏ hàng ngay khi vào
    }, []);

    const loadData = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setProducts(await res.json());
        } catch (e) { console.error(e); }
    };

    // 3. VIẾT LẠI HÀM FETCH CART (ĐỂ SỬ DỤNG setCart)
    const fetchCart = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/giohang', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data); // <--- Đã dùng setCart (Hết lỗi vàng)
            }
        } catch (e) { console.error(e); }
    };

    // Hàm chọn thuốc
    const handleProductClick = async (product) => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/products/${product.mathuoc}/available-lots`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lots = await res.json();

            if (lots.length === 0) {
                alert("Sản phẩm này đã hết hàng trong kho!");
                return;
            }
            setSelectedProduct(product);
            setAvailableLots(lots);
            setShowLotModal(true);
        } catch (e) { console.error(e); }
    };

    // Hàm thêm vào giỏ
    const handleAddToCart = async (lot) => {
        const token = localStorage.getItem('authToken');
        const payload = {
            maThuoc: selectedProduct.mathuoc,
            soLuong: 1,
            maLo: lot.maLo
        };

        try {
            const res = await fetch('http://localhost:5223/api/giohang', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowLotModal(false);
                fetchCart(); // Load lại giỏ hàng để thấy thay đổi
            } else {
                const err = await res.json();
                alert("Lỗi: " + err.message);
            }
        } catch (e) { console.error(e); }
    };

    // Hàm xóa khỏi giỏ (cho nhân viên)
    const handleRemoveItem = async (malo) => {
        const token = localStorage.getItem('authToken');
        try {
            await fetch(`http://localhost:5223/api/giohang/${malo}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCart();
        } catch(e) { console.error(e); }
    };

    // Lọc sản phẩm
    const filteredProducts = products.filter(p => 
        p.tenthuoc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tính tổng tiền
    const totalAmount = cart.reduce((sum, item) => sum + (item.dongia * item.soluong), 0);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* CỘT TRÁI: DANH SÁCH THUỐC */}
            <div className="w-2/3 p-4 overflow-y-auto">
                <div className="bg-white p-4 rounded shadow mb-4 sticky top-0 z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
                        <input 
                            className="w-full pl-10 pr-4 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tìm kiếm thuốc (Tên, hoạt chất)..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {filteredProducts.map(p => (
                        <div 
                            key={p.mathuoc} 
                            onClick={() => handleProductClick(p)}
                            className="bg-white p-3 rounded shadow hover:shadow-lg cursor-pointer transition border border-transparent hover:border-blue-500 relative"
                        >
                            <div className="h-24 w-full flex items-center justify-center bg-gray-50 mb-2 rounded">
                                <img src={p.hinhanh || 'https://placehold.co/100'} alt="" className="max-h-full max-w-full object-contain"/>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm truncate" title={p.tenthuoc}>{p.tenthuoc}</h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-red-600 font-bold">{p.giaban.toLocaleString()}đ</span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Tồn: {p.soluongton}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CỘT PHẢI: GIỎ HÀNG */}
            <div className="w-1/3 bg-white border-l flex flex-col h-full shadow-xl">
                <div className="p-4 bg-blue-600 text-white shadow-md">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart size={24}/> Đơn Hàng Mới
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50"/>
                            <p>Chưa có sản phẩm nào</p>
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                                <div>
                                    <div className="font-bold text-gray-800">{item.tenthuoc}</div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                        <span>ĐV: {item.donvitinh}</span>
                                        <span className="text-blue-600 font-mono">Lô: {item.malo}</span> 
                                    </div>
                                    <div className="text-sm mt-1">
                                        {item.soluong} x <span className="font-bold">{item.dongia.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-blue-700 mb-1">
                                        {(item.soluong * item.dongia).toLocaleString()}
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveItem(item.malo)}
                                        className="text-red-500 hover:bg-red-100 p-1 rounded transition"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-4 text-lg">
                        <span className="font-bold text-gray-600">Tổng tiền:</span>
                        <span className="font-bold text-2xl text-red-600">{totalAmount.toLocaleString()} VNĐ</span>
                    </div>
                    <button 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow transition disabled:bg-gray-400"
                        disabled={cart.length === 0}
                    >
                        THANH TOÁN (F4)
                    </button>
                </div>
            </div>

            {/* MODAL CHỌN LÔ (Giữ nguyên) */}
            {showLotModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
                            <h3 className="font-bold">Chọn lô xuất bán</h3>
                            <button onClick={() => setShowLotModal(false)}><X/></button>
                        </div>
                        <div className="p-4 bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Sản phẩm: <strong>{selectedProduct?.tenthuoc}</strong></p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableLots.map((lot) => (
                                    <div 
                                        key={lot.maLo}
                                        onClick={() => handleAddToCart(lot)}
                                        className="bg-white border p-3 rounded cursor-pointer hover:border-blue-500 hover:shadow-md transition flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                <Package size={16} className="text-blue-500"/> {lot.soLo}
                                            </div>
                                            <div className="text-xs text-gray-500">HSD: {new Date(lot.hanSuDung).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-gray-400">Tồn kho</span>
                                            <span className="font-bold text-lg text-blue-600">{lot.soLuongTon}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeePOS;