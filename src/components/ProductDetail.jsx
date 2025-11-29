import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = ({ onAddToCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('thongtin'); // Tab mặc định là thông tin chung
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API lấy chi tiết thuốc
        fetch(`http://localhost:5223/api/Thuoc/${id}`) // Sử dụng endpoint api/Thuoc cho User
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // Logic kiểm tra tồn kho
    const isOutOfStock = product && (product.soluongton <= 0);

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        onAddToCart(product.mathuoc, quantity);
        alert("Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = async () => {
        if (isOutOfStock) return;
        
        // 1. Thêm vào giỏ
        await onAddToCart(product.mathuoc, quantity);
        
        // 2. Fetch lại giỏ hàng để lấy thông tin lô chính xác
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5223/api/GioHang', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const updatedCart = await res.json();
                
                // 3. Lọc lấy sản phẩm vừa mua
                const targetItems = updatedCart.filter(item => item.mathuoc === product.mathuoc);

                // 4. Chuyển thẳng sang trang Đặt Hàng
                if (targetItems.length > 0) {
                    navigate('/dat-hang', { state: { selectedItems: targetItems } });
                } else {
                    navigate('/dat-hang'); // Fallback
                }
            }
        } catch (e) {
            console.error(e);
            navigate('/gio-hang');
        }
    };

    if (loading) return <div className="p-5 text-center">Đang tải chi tiết...</div>;
    if (!product) return <div className="p-5 text-center">Không tìm thấy sản phẩm.</div>;

    const defaultImg = 'https://placehold.co/400x400?text=No+Image';

    return (
        <div className="container" style={{maxWidth: '1200px', margin: '20px auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
            <div className="grid__row">
                {/* CỘT TRÁI: ẢNH */}
                <div className="grid__column-5" style={{width: '40%'}}>
                    <div style={{border: '1px solid #eee', borderRadius: '8px', padding: '20px', textAlign: 'center', position: 'relative'}}>
                        <img 
                            src={product.hinhanh || defaultImg} 
                            alt={product.tenthuoc} 
                            style={{maxWidth: '100%', height: 'auto', objectFit: 'contain', filter: isOutOfStock ? 'grayscale(100%)' : 'none'}} 
                        />
                        {isOutOfStock && (
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px'
                            }}>
                                TẠM HẾT HÀNG
                            </div>
                        )}
                    </div>
                </div>

                {/* CỘT GIỮA: THÔNG TIN CHI TIẾT */}
                <div className="grid__column-7" style={{width: '60%', paddingLeft: '30px'}}>
                    <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '10px'}}>{product.tenthuoc}</h1>
                    
                    {/* Thông tin cơ bản ánh xạ từ DB */}
                    <div style={{fontSize: '14px', color: '#555', marginBottom: '15px', lineHeight: '1.8'}}>
                        <p><strong>Mã thuốc:</strong> #{product.mathuoc}</p>
                        <p><strong>Hoạt chất:</strong> <span style={{color: '#1B51A6'}}>{product.hoatchat || 'Đang cập nhật'}</span></p>
                        <p><strong>Thương hiệu/Nhà SX:</strong> {product.nhasx || 'Đang cập nhật'}</p>
                        <p><strong>Quy cách:</strong> {product.quycachdonggoi || 'Đang cập nhật'}</p>
                        <p><strong>Số đăng ký:</strong> {product.sodangky || 'Đang cập nhật'}</p>
                    </div>

                    {/* Giá tiền */}
                    <div style={{background: '#f5f8ff', padding: '15px', borderRadius: '8px', margin: '15px 0'}}>
                        <h2 style={{color: '#d32f2f', fontSize: '28px', fontWeight: 'bold', margin: 0}}>
                            {formatPrice(product.giaban)} 
                            <span style={{fontSize: '14px', color: '#666', fontWeight: 'normal'}}> / {product.donvitinh}</span>
                        </h2>
                        {product.giacu > product.giaban && (
                            <p style={{textDecoration: 'line-through', color: '#999', margin: '5px 0 0'}}>
                                Giá cũ: {formatPrice(product.giacu)}
                            </p>
                        )}
                    </div>

                    {/* Chọn số lượng */}
                    <div style={{marginBottom: '20px'}}>
                        <span style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Số lượng:</span>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button 
                                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                className="btn_css" 
                                style={{width: '35px', height: '35px', padding: 0}}
                                disabled={isOutOfStock}
                            >-</button>
                            <input 
                                type="text" 
                                value={quantity} 
                                readOnly 
                                style={{width: '50px', height: '35px', textAlign: 'center', border: '1px solid #ddd', margin: '0 5px'}} 
                            />
                            <button 
                                onClick={() => setQuantity(q => q + 1)} 
                                className="btn_css" 
                                style={{width: '35px', height: '35px', padding: 0}}
                                disabled={isOutOfStock}
                            >+</button>
                            <span style={{marginLeft: '15px', fontSize: '13px', color: isOutOfStock ? 'red' : 'green'}}>
                                {isOutOfStock ? '(Hết hàng)' : `(Còn ${product.soluongton} sản phẩm)`}
                            </span>
                        </div>
                    </div>

                    {/* Nút bấm */}
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button 
                            onClick={handleBuyNow} 
                            disabled={isOutOfStock}
                            className="btn_css btn--primary_css" 
                            style={{
                                padding: '12px 30px', fontSize: '16px',
                                opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Mua ngay
                        </button>
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOutOfStock}
                            className="btn_css" 
                            style={{
                                padding: '12px 30px', fontSize: '16px', background: '#fff', color: '#1B51A6', border: '1px solid #1B51A6',
                                opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB THÔNG TIN CHI TIẾT (Mapping đúng với DB) */}
            <div style={{marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
                <div style={{borderBottom: '1px solid #ddd', display: 'flex', gap: '30px', marginBottom: '20px'}}>
                    {[
                        { key: 'thongtin', label: 'Thông tin chung' },
                        { key: 'lieudung', label: 'Liều dùng & Cách dùng' }, // Mapping từ cột lieudung
                        { key: 'chongchidinh', label: 'Chống chỉ định' }      // Mapping từ cột chongchidinh
                    ].map(tab => (
                        <button 
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '10px 0', 
                                border: 'none', 
                                background: 'transparent', 
                                borderBottom: activeTab === tab.key ? '3px solid #1B51A6' : '3px solid transparent',
                                color: activeTab === tab.key ? '#1B51A6' : '#666',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{padding: '10px', lineHeight: '1.8', color: '#333', minHeight: '150px'}}>
                    {/* Nội dung Tab Thông Tin Chung */}
                    {activeTab === 'thongtin' && (
                        <div>
                            <p><strong>Tên thuốc:</strong> {product.tenthuoc}</p>
                            <p><strong>Hoạt chất chính:</strong> {product.hoatchat || 'Đang cập nhật'}</p>
                            <p><strong>Loại thuốc:</strong> {product.loaithuoc || 'Thuốc'}</p>
                            <p><strong>Nhà sản xuất:</strong> {product.nhasx || 'Đang cập nhật'}</p>
                            <p><strong>Đơn vị tính:</strong> {product.donvitinh}</p>
                            <p><strong>Quy cách đóng gói:</strong> {product.quycachdonggoi}</p>
                            <p><strong>Số đăng ký (SĐK):</strong> {product.sodangky}</p>
                        </div>
                    )}

                    {/* Nội dung Tab Liều Dùng (DB: lieudung) */}
                    {activeTab === 'lieudung' && (
                        <div>
                            <p style={{whiteSpace: 'pre-line'}}>
                                {product.lieudung || "Chưa có thông tin liều dùng. Vui lòng tham khảo ý kiến bác sĩ."}
                            </p>
                        </div>
                    )}

                    {/* Nội dung Tab Chống Chỉ Định (DB: chongchidinh) */}
                    {activeTab === 'chongchidinh' && (
                        <div>
                             <p style={{whiteSpace: 'pre-line', color: '#d32f2f'}}>
                                {product.chongchidinh || "Không có thông tin chống chỉ định đặc biệt."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;