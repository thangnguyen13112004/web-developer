import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('authToken');
            try {
                // 1. GỌI ĐÚNG ĐƯỜNG DẪN ADMIN VỪA SỬA
                const res = await fetch('http://localhost:5223/api/admin/products', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if(res.ok) {
                    const data = await res.json();
                    console.log("Dữ liệu nhận được:", data); // Log để kiểm tra
                    setProducts(data);
                } else {
                    console.error("Lỗi API:", res.status);
                }
            } catch (err) {
                console.error("Lỗi kết nối:", err);
            }
        };
        fetchProducts();
    }, []);

    // 2. LỌC DỮ LIỆU (Dùng tên biến chữ thường khớp với Controller)
    const filteredProducts = products.filter(p => 
        p.tenthuoc && p.tenthuoc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto space-y-6 p-6"> {/* Thêm padding */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Danh sách Thuốc</h1>
                <Link to="/admin/products/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Thêm thuốc
                </Link>
            </div>

            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm thuốc..." 
                    className="w-full md:w-1/3 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thuốc</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <tr key={p.mathuoc} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                        <img 
                                            src={p.image || 'https://placehold.co/50x50'} 
                                            className="w-10 h-10 rounded-full object-cover border"
                                            alt="" 
                                            onError={(e) => e.target.src = 'https://placehold.co/50x50'}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{p.tenthuoc}</div>
                                            <div className="text-xs text-gray-500">{p.categoryName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link to={`/admin/products/edit/${p.mathuoc}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Sửa</Link>
                                        <button className="text-red-600 hover:text-red-900">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    Không tìm thấy dữ liệu thuốc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;