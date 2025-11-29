import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, X, Upload, Image as ImageIcon } from 'lucide-react';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        tenThuoc: '',
        hoatChat: '',
        soDangKy: '',
        quyCach: '', // Mapping với QuyCachDongGoi
        donViTinh: '',
        giaBan: 0,
        giaCu: 0,
        soLuongTon: 0,
        nhaSX: '',
        chongChiDinh: '',
        lieuDung: '',
        maLoai: '', 
        hinhAnhBase64: '' 
    });

    const [previewImg, setPreviewImg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            try {
                // 1. Lấy danh mục
                const catRes = await fetch('http://localhost:5223/api/admin/products/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(catRes.ok) setCategories(await catRes.json());

                // 2. Lấy chi tiết thuốc
                const prodRes = await fetch(`http://localhost:5223/api/admin/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!prodRes.ok) throw new Error('Không tìm thấy sản phẩm');
                
                const data = await prodRes.json();

                setFormData({
                    tenThuoc: data.tenthuoc || '',
                    hoatChat: data.hoatchat || '',
                    soDangKy: data.sodangky || '',
                    quyCach: data.quycachdonggoi || '', // Backend trả về quycachdonggoi
                    donViTinh: data.donvitinh || '',
                    giaBan: data.giaban || 0,
                    giaCu: data.giacu || 0,
                    soLuongTon: data.soluongton || 0,
                    nhaSX: data.nhasx || '',
                    chongChiDinh: data.chongchidinh || '',
                    lieuDung: data.lieudung || '',
                    maLoai: data.maloai || '',
                    hinhAnhBase64: data.hinhanh || ''
                });
                
                setPreviewImg(data.hinhanh);

            } catch (err) {
                console.error(err);
                alert('Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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

        // Chuẩn bị DTO để gửi lên Server
        // Cần khớp chính xác tên biến trong ProductCreateDto.cs
        const updateData = {
            TenThuoc: formData.tenThuoc,
            HoatChat: formData.hoatChat,
            SoDangKy: formData.soDangKy,
            QuyCachDongGoi: formData.quyCach, 
            DonViTinh: formData.donViTinh,
            GiaBan: parseFloat(formData.giaBan),
            GiaCu: parseFloat(formData.giaCu),
            SoLuongTon: parseInt(formData.soLuongTon),
            NhaSX: formData.nhaSX,
            ChongChiDinh: formData.chongChiDinh,
            LieuDung: formData.lieuDung,
            MaLoai: parseInt(formData.maLoai),
            HinhAnhBase64: formData.hinhAnhBase64 // Gửi chuỗi ảnh (cũ hoặc mới)
        };

        try {
            const res = await fetch(`http://localhost:5223/api/admin/products/${id}`, {
                method: 'PUT', // Đảm bảo dùng PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                alert('Cập nhật thành công!');
                navigate('/admin/products');
            } else {
                const err = await res.json();
                alert('Lỗi: ' + (err.message || 'Cập nhật thất bại'));
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối server');
        }
    };

    if(loading) return <div className="p-6 text-center">Đang tải...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl bg-white rounded shadow-lg my-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-2xl font-bold text-blue-700">Sửa Thuốc: {formData.tenThuoc}</h1>
                <Link to="/admin/products" className="text-gray-500 hover:text-gray-700"><X size={24}/></Link>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột Trái */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tên thuốc *</label>
                        <input name="tenThuoc" value={formData.tenThuoc} onChange={handleInputChange} required className="w-full border p-2 rounded"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Hoạt chất</label>
                        <input name="hoatChat" value={formData.hoatChat} onChange={handleInputChange} className="w-full border p-2 rounded"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Số đăng ký</label>
                            <input name="soDangKy" value={formData.soDangKy} onChange={handleInputChange} className="w-full border p-2 rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Nhà sản xuất</label>
                            <input name="nhaSX" value={formData.nhaSX} onChange={handleInputChange} className="w-full border p-2 rounded"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Quy cách</label>
                            <input name="quyCach" value={formData.quyCach} onChange={handleInputChange} className="w-full border p-2 rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Đơn vị tính</label>
                            <select name="donViTinh" value={formData.donViTinh} onChange={handleInputChange} className="w-full border p-2 rounded bg-white">
                                <option value="">-- Chọn --</option>
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

                {/* Cột Phải */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Giá bán (VNĐ)</label>
                            <input type="number" name="giaBan" value={formData.giaBan} onChange={handleInputChange} className="w-full border p-2 rounded font-bold text-red-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Giá cũ</label>
                            <input type="number" name="giaCu" value={formData.giaCu} onChange={handleInputChange} className="w-full border p-2 rounded bg-gray-50"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Tồn kho</label>
                        <input type="number" name="soLuongTon" value={formData.soLuongTon} onChange={handleInputChange} className="w-full border p-2 rounded"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Danh mục</label>
                        <select name="maLoai" value={formData.maLoai} onChange={handleInputChange} className="w-full border p-2 rounded bg-blue-50">
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => (
                                <option key={c.maLoai} value={c.maLoai}>{c.tenLoai}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Hình ảnh</label>
                        <div className="flex items-center gap-4">
                            {previewImg ? (
                                <img src={previewImg} alt="Preview" className="w-20 h-20 object-contain border rounded"/>
                            ) : (
                                <div className="w-20 h-20 bg-gray-100 border rounded flex items-center justify-center"><ImageIcon className="text-gray-400"/></div>
                            )}
                            <label className="cursor-pointer bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 flex items-center gap-1">
                                <Upload size={14}/> Thay ảnh
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Full Width */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Chống chỉ định</label>
                        <textarea name="chongChiDinh" value={formData.chongChiDinh} rows="2" onChange={handleInputChange} className="w-full border p-2 rounded"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Liều dùng</label>
                        <textarea name="lieuDung" value={formData.lieuDung} rows="2" onChange={handleInputChange} className="w-full border p-2 rounded"/>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4 border-t pt-4">
                    <Link to="/admin/products" className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-100">Hủy</Link>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 font-bold shadow flex items-center gap-2">
                        <Save size={18}/> Lưu Thay Đổi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;