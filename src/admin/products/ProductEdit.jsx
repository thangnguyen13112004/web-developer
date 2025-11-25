import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, X, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

const ProductEdit = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    
    // State dữ liệu
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Form
    const [formData, setFormData] = useState({
        tenThuoc: '',
        giaBan: '',
        soLuongTon: '',
        maLoai: '',
        moTa: '',       // Tương ứng description
        hinhAnh: []     // Mảng chứa các đường dẫn ảnh hoặc base64
    });

    // 1. Fetch dữ liệu khi vào trang (Sản phẩm + Danh mục)
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            try {
                // Fetch Categories
                const catRes = await fetch('http://localhost:5223/api/Categories'); 
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch Product Detail
                const prodRes = await fetch(`http://localhost:5223/api/admin/Products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!prodRes.ok) throw new Error('Không tìm thấy sản phẩm');
                
                const prodData = await prodRes.json();

                // Map dữ liệu từ API vào Form
                // Lưu ý: Logic xử lý ảnh tùy thuộc vào API trả về chuỗi hay mảng. 
                // Ở đây giả định API trả về mảng hoặc chuỗi đơn, ta sẽ chuẩn hóa thành mảng.
                let images = [];
                if (Array.isArray(prodData.hinhAnh)) {
                    images = prodData.hinhAnh;
                } else if (prodData.hinhAnh) {
                    images = [prodData.hinhAnh];
                }

                setFormData({
                    tenThuoc: prodData.tenThuoc || '',
                    giaBan: prodData.giaBan || 0,
                    soLuongTon: prodData.soLuongTon || 0,
                    maLoai: prodData.maLoai || '',
                    moTa: prodData.moTa || '', 
                    hinhAnh: images
                });

            } catch (err) {
                console.error(err);
                setError('Lỗi khi tải dữ liệu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // 2. Xử lý thay đổi input text/number
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Xử lý logic ẢNH (Giống Blade)
    
    // Thêm ô nhập URL ảnh mới
    const handleAddUrl = () => {
        setFormData(prev => ({
            ...prev,
            hinhAnh: [...prev.hinhAnh, ''] // Thêm chuỗi rỗng
        }));
    };

    // Cập nhật giá trị URL tại index cụ thể
    const handleUrlChange = (index, value) => {
        const newImages = [...formData.hinhAnh];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, hinhAnh: newImages }));
    };

    // Upload file từ máy -> Base64
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                hinhAnh: [...prev.hinhAnh, reader.result] // Thêm chuỗi Base64 vào mảng
            }));
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input để chọn lại file cũ được
    };

    // Xóa ảnh khỏi danh sách
    const handleRemoveImage = (index) => {
        const newImages = formData.hinhAnh.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, hinhAnh: newImages }));
    };

    // 4. Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            // Lọc bỏ các link ảnh rỗng trước khi gửi
            const cleanData = {
                ...formData,
                hinhAnh: formData.hinhAnh.filter(img => img && img.trim() !== '')
            };

            const res = await fetch(`http://localhost:5223/api/admin/Products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cleanData)
            });

            if (res.ok) {
                alert('Cập nhật thành công!');
                navigate('/admin/products');
            } else {
                const errData = await res.json();
                alert('Lỗi: ' + (errData.message || 'Cập nhật thất bại'));
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-600">#{id}</span> Sửa sản phẩm
                </h1>
                <Link to="/admin/products" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <X size={20}/> Hủy bỏ
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                
                {/* Tên sản phẩm */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                    <input 
                        type="text" 
                        name="tenThuoc" 
                        value={formData.tenThuoc} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Giá & Tồn kho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                        <input 
                            type="number" 
                            name="giaBan" 
                            value={formData.giaBan} 
                            onChange={handleInputChange} 
                            required 
                            min="0"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho *</label>
                        <input 
                            type="number" 
                            name="soLuongTon" 
                            value={formData.soLuongTon} 
                            onChange={handleInputChange} 
                            required 
                            min="0"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Danh mục & Mô tả */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                        <select 
                            name="maLoai" 
                            value={formData.maLoai} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.maLoai || cat.id} value={cat.maLoai || cat.id}>
                                    {cat.tenLoai || cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Hoạt chất</label>
                        <textarea 
                            name="moTa" 
                            value={formData.moTa} 
                            onChange={handleInputChange} 
                            rows="3"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>
                </div>

                {/* Quản lý Hình ảnh (Giống Blade Logic) */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <ImageIcon size={18}/> Hình ảnh sản phẩm
                    </label>

                    <div className="space-y-3">
                        {formData.hinhAnh.map((img, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded border">
                                {/* Preview Ảnh (nếu có link/base64 hợp lệ) */}
                                <div className="w-12 h-12 flex-shrink-0 bg-white border rounded overflow-hidden flex items-center justify-center">
                                    {img && img.length > 0 ? (
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={20}/>
                                    )}
                                </div>

                                {/* Input URL (Nếu base64 quá dài thì ẩn đi cho gọn, giống blade logic) */}
                                <div className="flex-1">
                                    {img.startsWith('data:image') ? (
                                        <div className="text-xs text-green-600 font-medium truncate bg-green-50 px-2 py-1 rounded border border-green-200">
                                            Đã tải lên ảnh mới (Base64)
                                        </div>
                                    ) : (
                                        <input 
                                            type="text" 
                                            value={img}
                                            onChange={(e) => handleUrlChange(index, e.target.value)}
                                            placeholder="Nhập URL hình ảnh..."
                                            className="w-full text-sm border-gray-300 rounded border px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveImage(index)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                    title="Xóa ảnh này"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Nút thêm ảnh */}
                    <div className="mt-4 flex flex-wrap gap-4 items-center">
                        <button 
                            type="button" 
                            onClick={handleAddUrl}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Plus size={16}/> Thêm URL ảnh
                        </button>

                        <label className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium cursor-pointer">
                            <Upload size={16}/> Upload từ máy
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link 
                        to="/admin/products"
                        className="px-5 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
                    >
                        Hủy
                    </Link>
                    <button 
                        type="submit" 
                        className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <Save size={18}/> Cập nhật sản phẩm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;