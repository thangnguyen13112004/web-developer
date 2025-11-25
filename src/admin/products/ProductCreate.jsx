import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCreate = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    
    // State Form
    const [formData, setFormData] = useState({
        tenThuoc: '',
        giaBan: '',
        soLuongTon: '',
        maLoai: '',
        hinhAnhBase64: '' // Lưu chuỗi base64 để gửi về API
    });

    // Preview ảnh
    const [previewImg, setPreviewImg] = useState(null);

    // Load danh mục khi vào trang
    useEffect(() => {
        // Fetch categories từ API (giả định có API này)
        fetch('http://localhost:5223/api/admin/Categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    }, []);

    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Xử lý upload ảnh (FileReader như trong JS cũ)
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
            const res = await fetch('http://localhost:5223/api/admin/Products', {
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
                alert('Có lỗi xảy ra!');
            }
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Thêm Thuốc Mới</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Tên thuốc</label>
                    <input name="tenThuoc" onChange={handleInputChange} required className="w-full border p-2 rounded"/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Giá bán</label>
                        <input type="number" name="giaBan" onChange={handleInputChange} required className="w-full border p-2 rounded"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tồn kho ban đầu</label>
                        <input type="number" name="soLuongTon" onChange={handleInputChange} required className="w-full border p-2 rounded"/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Danh mục</label>
                    <select name="maLoai" onChange={handleInputChange} required className="w-full border p-2 rounded">
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => (
                            <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Hình ảnh</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2"/>
                    {previewImg && (
                        <img src={previewImg} alt="Preview" className="w-32 h-32 object-cover border rounded"/>
                    )}
                </div>

                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Lưu Sản Phẩm
                </button>
            </form>
        </div>
    );
};

export default ProductCreate;