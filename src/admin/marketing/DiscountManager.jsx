import React, { useState, useEffect } from 'react';
import { Tag, Save, History, CheckSquare, List } from 'lucide-react';

const DiscountManager = () => {
    const [activeTab, setActiveTab] = useState('create'); // 'create' hoặc 'history'
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]); // Tất cả sản phẩm để chọn
    const [history, setHistory] = useState([]);

    // Form State
    const [campaignName, setCampaignName] = useState('');
    const [discountType, setDiscountType] = useState('Category'); // 'Category' | 'CustomGroup'
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // List ID
    const [discountPercent, setDiscountPercent] = useState(10);

    useEffect(() => {
        // Load danh mục và sản phẩm
        fetch('http://localhost:5223/api/LoaiThuoc').then(res => res.json()).then(setCategories);
        // 2. Load TẤT CẢ sản phẩm (SỬA ĐOẠN NÀY)
        // Thêm pageSize=1000 để lấy hết danh sách, tránh bị phân trang chỉ lấy 10 cái
        fetch('http://localhost:5223/api/Thuoc?pageSize=1000') 
            .then(res => res.json())
            .then(resData => {
                // Kiểm tra xem API trả về mảng hay object phân trang
                if (resData.data && Array.isArray(resData.data)) {
                    // Nếu là Object phân trang (Code mới) -> Lấy phần .data
                    setProducts(resData.data);
                } else if (Array.isArray(resData)) {
                    // Nếu là Mảng (Code cũ) -> Lấy trực tiếp
                    setProducts(resData);
                }
            })
            .catch(err => console.error("Lỗi tải sản phẩm:", err));

        loadHistory();
    }, []);

    // 1. Sửa hàm loadHistory: Thêm Token
    const loadHistory = () => {
        const token = localStorage.getItem('authToken'); // Lấy token
        if (!token) return;

        fetch('http://localhost:5223/api/admin/discount/history', {
            headers: { 
                'Authorization': `Bearer ${token}` // <--- THÊM DÒNG NÀY
            }
        })
        .then(res => {
            if (res.status === 401) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                return [];
            }
            return res.json();
        })
        .then(data => {
            if(data) setHistory(data);
        })
        .catch(err => console.error("Lỗi tải lịch sử:", err));
    };

    // 2. Sửa hàm handleApply: Thêm Token
    const handleApply = async () => {
        if (!campaignName) return alert("Vui lòng nhập tên chương trình");
        const token = localStorage.getItem('authToken'); // Lấy token

        const payload = {
            TenDotKM: campaignName,
            LoaiApDung: discountType,
            PhanTramGiam: parseFloat(discountPercent),
            TargetId: discountType === 'Category' ? parseInt(selectedCategory) : null,
            ProductIds: discountType === 'CustomGroup' ? selectedProducts : []
        };

        try {
            const res = await fetch('http://localhost:5223/api/admin/discount/apply', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- QUAN TRỌNG NHẤT
                },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                alert("Đã áp dụng khuyến mãi thành công!");
                loadHistory(); 
                setCampaignName('');
                setSelectedProducts([]); // Reset list chọn
            } else {
                if (res.status === 401) {
                    alert("Bạn không có quyền thực hiện (401). Hãy đăng nhập lại.");
                } else {
                    const errText = await res.text(); // Đọc text lỗi từ server
                    alert("Lỗi: " + errText);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server");
        }
    };

    // Hàm chọn sản phẩm cho Custom Group
    const toggleProduct = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Tag className="text-blue-600" /> Quản lý Khuyến Mãi Hệ Thống
            </h2>

            {/* TABS */}
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                >
                    <Save size={18} /> Tạo mới
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                >
                    <History size={18} /> Lịch sử
                </button>
            </div>

            {/* VIEW TẠO MỚI */}
            {activeTab === 'create' && (
                <div className="bg-white p-6 rounded shadow max-w-4xl">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Cột trái: Cấu hình */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên chương trình</label>
                                <input 
                                    className="w-full border p-2 rounded" 
                                    placeholder="VD: Xả kho cuối tháng 10"
                                    value={campaignName}
                                    onChange={e => setCampaignName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mức giảm giá (%)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded"
                                        value={discountPercent}
                                        onChange={e => setDiscountPercent(e.target.value)}
                                    />
                                    <span className="font-bold text-lg">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Hình thức áp dụng</label>
                                <select 
                                    className="w-full border p-2 rounded"
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value)}
                                >
                                    <option value="Category">Theo Danh Mục</option>
                                    <option value="CustomGroup">Chọn Sản Phẩm (Custom)</option>
                                </select>
                            </div>

                            {discountType === 'Category' && (
                                <div className="p-4 bg-blue-50 rounded border border-blue-100">
                                    <label className="block text-sm font-medium mb-2">Chọn Danh Mục cần giảm:</label>
                                    <select 
                                        className="w-full border p-2 rounded"
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => (
                                            <option key={c.maloai} value={c.maloai}>{c.tenloai}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-blue-600 mt-2">
                                        * Lưu ý: Tất cả sản phẩm trong danh mục này sẽ được giảm {discountPercent}%.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Chọn sản phẩm (Nếu là CustomGroup) */}
                        {discountType === 'CustomGroup' && (
                            <div className="border rounded p-4 h-96 overflow-y-auto">
                                <h4 className="font-bold mb-2 flex items-center justify-between">
                                    Chọn sản phẩm 
                                    <span className="text-sm font-normal text-slate-500">({selectedProducts.length} đã chọn)</span>
                                </h4>
                                {products.map(p => (
                                    <div key={p.mathuoc} className="flex items-center gap-2 py-2 border-b last:border-0">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedProducts.includes(p.mathuoc)}
                                            onChange={() => toggleProduct(p.mathuoc)}
                                            className="w-4 h-4"
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium">{p.tenthuoc}</p>
                                            <p className="text-slate-500">{p.mathuoc} - {p.donvitinh}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-end">
                        <button 
                            onClick={handleApply}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow transition"
                        >
                            Xác nhận & Áp dụng
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW LỊCH SỬ */}
            {activeTab === 'history' && (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 border-b">
                            <tr>
                                <th className="p-4">Tên chương trình</th>
                                <th className="p-4">Hình thức</th>
                                <th className="p-4">Mức giảm</th>
                                <th className="p-4">Số lượng SP</th>
                                <th className="p-4">Ngày thực hiện</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.maDotKm} className="border-b hover:bg-slate-50">
                                    <td className="p-4 font-medium">{h.tenDotKm}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${h.loaiApDung === 'Category' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {h.loaiApDung === 'Category' ? 'Danh mục' : 'Tùy chọn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-red-600 font-bold">-{h.giaTriGiam}%</td>
                                    <td className="p-4">{h.soLuongSanPham}</td>
                                    <td className="p-4 text-slate-500">{new Date(h.ngayBatDau).toLocaleString()}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Chưa có dữ liệu lịch sử.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DiscountManager;