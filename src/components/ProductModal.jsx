import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
    if (!price) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Ảnh mặc định
const defaultImage = 'https://placehold.co/300x300/EBF3FA/1B51A6?text=Pharmacity';

function ProductModal({ selectedProductId, onAddToCart }) {
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (selectedProductId) {
            setLoading(true);
            setProduct(null);
            setError(null);
            setQuantity(1);

            // API lấy chi tiết sản phẩm
            fetch(`http://localhost:5223/api/Thuoc/${selectedProductId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Không tìm thấy chi tiết sản phẩm');
                    return res.json();
                })
                .then(data => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [selectedProductId]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        
        // Cho phép để trống tạm thời khi đang xóa số (để gõ số mới)
        if (val === '') {
            setQuantity(''); 
            return;
        }

        // Chỉ nhận số nguyên
        const numVal = parseInt(val, 10);
        if (!isNaN(numVal)) {
            // Kiểm tra tồn kho (nếu có thông tin tồn kho)
            if (product.soluongton && numVal > product.soluongton) {
                setQuantity(product.soluongton); // Set về max
            } else {
                setQuantity(numVal);
            }
        }
    };

    // 2. Xử lý khi input bị mất focus (onBlur) -> Chống để trống hoặc số 0
    const handleBlur = () => {
        if (quantity === '' || quantity < 1) {
            setQuantity(1);
        }
    };

    // 3. Hàm cộng trừ cũ (Sửa lại chút để check max)
    const handleButtonChange = (amount) => {
        setQuantity(prev => {
            // Nếu đang rỗng thì coi là 0
            const current = prev === '' ? 0 : prev;
            const newVal = current + amount;
            
            if (newVal < 1) return 1;
            if (product.soluongton && newVal > product.soluongton) return product.soluongton;
            
            return newVal;
        });
    };

    // --- LOGIC MỚI: KIỂM TRA TỒN KHO ---
    // Nếu soluongton <= 0 hoặc null -> coi như hết hàng
    const isOutOfStock = product && (product.soluongton === null || product.soluongton <= 0);

    const handleAddToCartClick = () => {
        if (!product) return;
        
        // --- CHẶN: Nếu hết hàng thì không làm gì cả ---
        if (isOutOfStock) {
            alert("Sản phẩm này tạm thời hết hàng.");
            return;
        }

        // Gọi hàm từ App.jsx
        onAddToCart(product.mathuoc, quantity); 
    };

    const handleBuyNow = async () => {
        if (!product || isOutOfStock) return;

        // Bước 1: Gọi thêm vào giỏ
        await onAddToCart(product.mathuoc, quantity);

        // Bước 2: Lấy dữ liệu mới
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5223/api/GioHang', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const updatedCart = await res.json();
                const targetItems = updatedCart.filter(item => item.mathuoc === product.mathuoc);

                // --- BẮT ĐẦU ĐOẠN CODE FIX LỖI MÀN HÌNH ĐEN ---
                
                // 1. Đóng Modal hiện tại (Ẩn đi)
                const modalElement = document.getElementById('productModal');
                if (modalElement) {
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                }

                // 2. Xóa lớp 'modal-backdrop' (Cái màn đen chết tiệt)
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());

                // 3. Reset lại Body (Để cho phép cuộn trang trở lại)
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';

                // --- KẾT THÚC ĐOẠN CODE FIX ---

                // Bước 4: Chuyển trang
                if (targetItems.length > 0) {
                    navigate('/dat-hang', { state: { selectedItems: targetItems } });
                } else {
                    navigate('/gio-hang');
                }
            }
        } catch (error) {
            console.error("Lỗi khi xử lý mua ngay:", error);
            // Vẫn cần dọn dẹp nếu có lỗi
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style = '';
        }
    };

    const renderModalBody = () => {
        if (loading) return <div className="text-center p-5"><h4>Đang tải dữ liệu...</h4></div>;
        if (error) return <div className="alert alert-danger">Lỗi: {error}</div>;
        if (!product) return null; 

        return (
            <div className="row custom-row-gutters">
                {/* Cột trái: Hình ảnh */}
                <div className="col-6 position-relative text-center product-image-container">
                    <img 
                        src={product.hinhanh || defaultImage} 
                        alt={product.tenthuoc} 
                        className={`img-fluid rounded product-modal-img ${isOutOfStock ? 'grayscale' : ''}`} // Thêm class xám nếu hết hàng
                    />
                    
                    {/* --- HIỂN THỊ NHÃN "SẮP CÓ" --- */}
                    {isOutOfStock && (
                        <div className="out-of-stock-badge">
                            <span>Sắp có hàng</span>
                        </div>
                    )}
                </div>
                
                {/* Cột phải: Thông tin */}
                <div className="col-6 product-info-col">
                    <div className="d-flex align-items-center mb-2">
                        <small className="product-title-ship">Miễn phí vận chuyển cho mọi đơn hàng 0đ</small>
                    </div>
                    
                    <h4 className="product-name">{product.tenthuoc}</h4>
                    
                    {/* Phần giá */}
                    <div className="product-price-section my-3">
                        {product.giacu && product.giacu > 0 && (
                             <span className="product-price-old">
                                {formatPrice(product.giacu)}
                            </span>
                        )}
                        <span className={`product-price-current ${isOutOfStock ? 'text-muted' : ''}`}>
                            {isOutOfStock ? "Liên hệ" : `${formatPrice(product.giaban)} / ${product.donvitinh}`}
                        </span>
                    </div>

                    <p className="product-extra-info">Hoạt chất: {product.hoatchat}</p>
                    
                    {/* Hiển thị tồn kho (để debug hoặc thông báo cho khách) */}
                    <p className="text-sm text-muted">
                        Tình trạng: {isOutOfStock ? <span className="text-danger fw-bold">Tạm hết hàng</span> : <span className="text-success">Còn hàng</span>}
                    </p>
                    
                    <hr />
                    
                    {/* Số lượng */}
                    <div className="d-flex align-items-center mb-4">
                        <span className="me-3">Số lượng</span>
                        <div className="input-group quantity-control">
                            <button 
                                className="btn btn-outline-secondary btn-qty" 
                                type="button" 
                                onClick={() => handleButtonChange(-1)} // Đổi tên hàm
                                disabled={isOutOfStock}
                            >-</button>
                            
                            <input 
                                type="number" // Đổi thành type number (hoặc text)
                                className="form-control text-center input-qty" 
                                value={quantity} 
                                onChange={handleInputChange} // Thêm sự kiện onChange
                                onBlur={handleBlur}          // Thêm sự kiện onBlur
                                disabled={isOutOfStock}
                                min="1"
                                max={product?.soluongton}
                            />
                            
                            <button 
                                className="btn btn-outline-secondary btn-qty" 
                                type="button" 
                                onClick={() => handleButtonChange(1)} // Đổi tên hàm
                                disabled={isOutOfStock}
                            >+</button>
                        </div>
                    </div>

                    {/* Nút bấm Mua hàng / Thêm giỏ */}
                    <div className="d-grid gap-2">
                        {/* Nút Mua Ngay */}
                        <button 
                            className={`btn_css btn-primary_css btn-mua-ngay ${isOutOfStock ? 'disabled' : ''}`} 
                            type="button"
                            disabled={isOutOfStock}
                            onClick={handleBuyNow} // <-- Gắn hàm mới vào đây
                            style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                        >
                            {isOutOfStock ? "Tạm hết hàng" : "Mua ngay"}
                        </button>

                        {/* Nút Thêm Vào Giỏ */}
                        <button 
                            className={`btn_css btn-them-gio ${isOutOfStock ? 'disabled' : ''}`} 
                            type="button" 
                            onClick={handleAddToCartClick}
                            disabled={isOutOfStock}
                            style={{ 
                                backgroundColor: isOutOfStock ? '#e0e0e0' : '', 
                                color: isOutOfStock ? '#999' : '',
                                borderColor: isOutOfStock ? '#ccc' : '',
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer' 
                            }}
                        >
                            {isOutOfStock ? "Sắp có hàng" : "Thêm vào giỏ"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content product-modal-content">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title" id="productModalLabel">Thông tin sản phẩm</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body pt-2">
                        {renderModalBody()} 
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;