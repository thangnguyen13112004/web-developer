import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, X } from 'lucide-react'; // Icon đẹp hơn

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // State danh mục
    
    // State bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(''); // Lưu mã loại đang chọn

    // State Modal chi tiết
    const [selectedProduct, setSelectedProduct] = useState(null);

    // 1. Fetch Dữ liệu (Sản phẩm + Danh mục)
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            
            // Nếu không có token thì không gọi API để tránh lỗi
            if (!token) return; 

            try {
                // --- GỌI API SẢN PHẨM ---
                const prodRes = await fetch('http://localhost:5223/api/admin/products', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(prodRes.ok) setProducts(await prodRes.json());

                // --- GỌI API LẤY DANH MỤC (SỬA LẠI ĐOẠN NÀY) ---
                // Lỗi cũ: Thiếu headers chứa token nên bị chặn (401)
                const catRes = await fetch('http://localhost:5223/api/admin/products/categories', {
                    headers: { 'Authorization': `Bearer ${token}` } // <--- QUAN TRỌNG: PHẢI CÓ DÒNG NÀY
                });

                if(catRes.ok) {
                    const catData = await catRes.json();
                    console.log("Danh mục tải thành công:", catData); 
                    setCategories(catData);
                } else {
                    console.error("Lỗi tải danh mục:", catRes.status);
                }

            } catch (err) {
                console.error("Lỗi kết nối:", err);
            }
        };
        fetchData();
    }, []);

    // 2. Logic Lọc dữ liệu (Kết hợp Tìm kiếm + Danh mục)
    const filteredProducts = products.filter(p => {
        const matchName = p.tenthuoc && p.tenthuoc.toLowerCase().includes(searchTerm.toLowerCase());
        // Nếu selectedCategory rỗng thì lấy hết, ngược lại phải trùng maloai
        const matchCat = selectedCategory === '' || p.maloai == selectedCategory;
        
        return matchName && matchCat;
    });

    // Hàm mở modal xem chi tiết
    const handleViewDetail = (product) => {
        setSelectedProduct(product);
    };

    const handleDeleteProduct = async (id) => {
        if(!window.confirm("Xóa thuốc này?")) return;
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5223/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            alert("Đã xóa");
            // Gọi lại hàm fetch data (cần tách logic fetch ra khỏi useEffect để tái sử dụng)
            window.location.reload();
        } else {
            const err = await res.json();
            alert("Lỗi: " + err.message);
        }
    }

    return (
        <div className="container mx-auto space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Kho Thuốc</h1>
                <Link to="/admin/products/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2">
                   + Thêm thuốc mới
                </Link>
            </div>

            {/* --- THANH CÔNG CỤ LỌC --- */}
            <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4">
                {/* Tìm kiếm */}
                <input 
                    type="text" 
                    placeholder="Tìm theo tên thuốc, hoạt chất..." 
                    className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Dropdown Danh Mục (ĐÃ SỬA) */}
                <select 
                    className="w-full md:w-64 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">-- Tất cả danh mục --</option>
                    {/* Map dữ liệu danh mục vào đây */}
                    {categories.map(cat => (
                        <option key={cat.maLoai} value={cat.maLoai}>
                            {cat.tenLoai}
                        </option>
                    ))}
                </select>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hoạt chất / Đơn vị</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Giá bán</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tồn kho</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <tr key={p.mathuoc} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={p.hinhanh || 'https://placehold.co/50x50'} 
                                                className="w-12 h-12 rounded object-cover border"
                                                alt="" 
                                                onError={(e) => e.target.src = 'https://placehold.co/50x50'}
                                            />
                                            <div>
                                                <div className="font-bold text-gray-900">{p.tenthuoc}</div>
                                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                                                    {p.tenloai}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium">{p.hoatchat || '-'}</div>
                                        <div className="text-xs text-gray-400">ĐVT: {p.donvitinh}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.giaban)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.soluongton > 0 ? (
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.soluongton > 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {p.soluongton} {p.donvitinh}
                                            </span>
                                        ) : (
                                            // HIỂN THỊ CẢNH BÁO CHO ADMIN
                                            <div className="flex flex-col items-start">
                                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 mb-1">
                                                    Hết hàng
                                                </span>
                                                <span className="text-[10px] text-red-500 italic">
                                                    (Chưa nhập lô)
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-3">
                                        <button 
                                            onClick={() => handleViewDetail(p)}
                                            className="text-gray-500 hover:text-blue-600" title="Xem chi tiết"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <Link to={`/admin/products/edit/${p.mathuoc}`} className="text-blue-600 hover:text-blue-800" title="Sửa">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDeleteProduct(p.mathuoc)}
                                                className="text-red-500 hover:text-red-700" 
                                                title="Xóa">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Không tìm thấy dữ liệu.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL CHI TIẾT SẢN PHẨM --- */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Chi tiết thuốc: {selectedProduct.tenthuoc}</h3>
                            <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-red-500"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[80vh]">
                            {/* Cột Trái: Ảnh */}
                            <div className="col-span-1">
                                <img 
                                    src={selectedProduct.hinhanh || 'https://placehold.co/300x300'} 
                                    className="w-full h-auto rounded border shadow-sm object-contain bg-white" 
                                    alt="Product"
                                />
                                <div className="mt-4 text-center">
                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                        {selectedProduct.tenloai}
                                    </span>
                                </div>
                            </div>

                            {/* Cột Phải: Thông tin chi tiết */}
                            <div className="col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Mã thuốc</label>
                                        <p className="text-gray-800 font-medium">#{selectedProduct.mathuoc}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Số đăng ký</label>
                                        <p className="text-gray-800 font-medium">{selectedProduct.sodangky || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Hoạt chất</label>
                                        <p className="text-gray-800 font-medium">{selectedProduct.hoatchat || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Nhà sản xuất</label>
                                        <p className="text-gray-800 font-medium">{selectedProduct.nhasx || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Giá bán</label>
                                        <p className="text-red-600 text-lg font-bold">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.giaban)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold">Tồn kho</label>
                                        <p className="text-gray-800 font-medium">{selectedProduct.soluongton} ({selectedProduct.donvitinh})</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Quy cách đóng gói</label>
                                    <p className="text-gray-700">{selectedProduct.quycach || '-'}</p>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Chống chỉ định</label>
                                    <p className="text-gray-700 bg-red-50 p-2 rounded text-sm border border-red-100">
                                        {selectedProduct.chongchidinh || 'Không có ghi chú'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Liều dùng</label>
                                    <p className="text-gray-700 bg-blue-50 p-2 rounded text-sm border border-blue-100">
                                        {selectedProduct.lieudung || 'Theo chỉ định của bác sĩ'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setSelectedProduct(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;