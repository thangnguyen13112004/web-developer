import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ProductCreate = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    
    // Khởi tạo state với đầy đủ trường (Giá trị mặc định 0 cho số)
    const [formData, setFormData] = useState({
        tenThuoc: '',
        hoatChat: '',
        soDangKy: '',
        quyCach: '',
        donViTinh: 'Hộp',
        giaBan: 0,
        giaCu: 0, // Trường giá cũ
        soLuongTon: 0, // Tồn kho mặc định là 0
        nhaSX: '',
        chongChiDinh: '',
        lieuDung: '',
        maLoai: '', 
        hinhAnhBase64: ''
    });

    const [previewImg, setPreviewImg] = useState(null);

    // Lấy danh mục (ĐÃ FIX: Thêm Token vào Header)
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        fetch('http://localhost:5223/api/admin/products/categories', {
            headers: { 'Authorization': `Bearer ${token}` } // <-- Quan trọng: Phải có Token
        })
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh mục");
                return res.json();
            })
            .then(data => setCategories(data))
            .catch(err => console.error("Lỗi tải danh mục:", err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({...formData, hinhAnhBase64: reader.result});
            setPreviewImg(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            const res = await fetch('http://localhost:5223/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if(res.ok) {
                alert('Thêm thuốc thành công!');
                navigate('/admin/products');
            } else {
                const err = await res.json();
                alert('Lỗi: ' + JSON.stringify(err));
            }
        } catch(err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl bg-white rounded shadow-lg my-6">
            <h1 className="text-2xl font-bold mb-6 text-blue-700 border-b pb-2">Thêm Thuốc Mới</h1>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* --- Cột Trái: Thông tin cơ bản --- */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tên thuốc *</label>
                        <input 
                            name="tenThuoc" 
                            value={formData.tenThuoc}
                            onChange={handleInputChange} 
                            required 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold mb-1">Hoạt chất</label>
                        <input 
                            name="hoatChat" 
                            value={formData.hoatChat}
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Số đăng ký</label>
                            <input 
                                name="soDangKy" 
                                value={formData.soDangKy}
                                onChange={handleInputChange} 
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Nhà sản xuất</label>
                            <input 
                                name="nhaSX" 
                                value={formData.nhaSX}
                                onChange={handleInputChange} 
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Quy cách</label>
                            <input 
                                name="quyCach" 
                                value={formData.quyCach}
                                placeholder="Hộp 10 vỉ..." 
                                onChange={handleInputChange} 
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Đơn vị tính</label>
                            <select 
                                name="donViTinh" 
                                value={formData.donViTinh}
                                onChange={handleInputChange} 
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="Hộp">Hộp</option>
                                <option value="Vỉ">Vỉ</option>
                                <option value="Chai">Chai</option>
                                <option value="Tuýp">Tuýp</option>
                                <option value="Viên">Viên</option>
                                <option value="Gói">Gói</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Cột Phải: Giá & Phân loại --- */}
                <div className="space-y-4">
                    {/* ĐÃ THÊM: Nhập Giá cũ */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Giá bán (VNĐ) *</label>
                            <input 
                                type="number" 
                                name="giaBan" 
                                value={formData.giaBan} // Controlled Component
                                onChange={handleInputChange} 
                                required 
                                min="0"
                                className="w-full border p-2 rounded font-bold text-red-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Giá cũ (VNĐ)</label>
                            <input 
                                type="number" 
                                name="giaCu" 
                                value={formData.giaCu} // Controlled Component
                                onChange={handleInputChange} 
                                min="0"
                                className="w-full border p-2 rounded text-gray-500 bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* ĐÃ FIX: Hiển thị số 0 mặc định */}
                    <div>
                        <label className="block text-sm font-bold mb-1">Tồn kho ban đầu *</label>
                        <input 
                            type="number" 
                            name="soLuongTon" 
                            value={formData.soLuongTon} // Controlled Component
                            onChange={handleInputChange} 
                            required 
                            min="0"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Dropdown Danh mục (Đã fix lỗi fetch API) */}
                    <div>
                        <label className="block text-sm font-bold mb-1">Danh mục thuốc *</label>
                        <select 
                            name="maLoai" 
                            value={formData.maLoai}
                            onChange={handleInputChange} 
                            required 
                            className="w-full border p-2 rounded bg-blue-50"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => (
                                <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Hình ảnh minh họa</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm"/>
                        {previewImg && (
                            <img src={previewImg} alt="Preview" className="mt-2 w-32 h-32 object-contain border rounded"/>
                        )}
                    </div>
                </div>

                {/* --- Phần Dưới: Thông tin y tế (Full width) --- */}
                <div className="md:col-span-2 space-y-4 border-t pt-4">
                    <h3 className="font-bold text-gray-700">Thông tin y tế</h3>
                    <div>
                        <label className="block text-sm font-bold mb-1">Chống chỉ định</label>
                        <textarea 
                            name="chongChiDinh" 
                            value={formData.chongChiDinh}
                            rows="2" 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Liều dùng</label>
                        <textarea 
                            name="lieuDung" 
                            value={formData.lieuDung}
                            rows="2" 
                            onChange={handleInputChange} 
                            className="w-full border p-2 rounded"
                        ></textarea>
                    </div>
                </div>

                {/* Nút Submit */}
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <Link to="/admin/products" className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-100">Hủy</Link>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 font-bold shadow">
                        Lưu Sản Phẩm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductCreate;