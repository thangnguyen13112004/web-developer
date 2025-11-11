import React, { useState, useEffect } from 'react';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
    if (!price) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Ảnh mặc định
const defaultImage = 'https://placehold.co/300x300/EBF3FA/1B51A6?text=Pharmacity';

function ProductModal({ selectedProductId, onAddToCart }) {
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

            // Nhớ thay đúng cổng API .NET của bạn
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

    const handleQuantityChange = (amount) => {
        setQuantity(prevQty => (prevQty + amount < 1 ? 1 : prevQty + amount));
    };

    // 2. HÀM MỚI KHI CLICK "THÊM VÀO GIỎ"
    const handleAddToCartClick = () => {
        if (!product) return;
        
        // Gọi hàm từ App.jsx
        onAddToCart(product.mathuoc, quantity); 
        
        // (Tùy chọn: Tự động đóng modal sau khi thêm)
        //bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    };

    const renderModalBody = () => {
        if (loading) return <div className="text-center p-5"><h4>Đang tải dữ liệu...</h4></div>;
        if (error) return <div className="alert alert-danger">Lỗi: {error}</div>;
        if (!product) return null; // Ẩn khi không có dữ liệu

        // Khi đã có dữ liệu sản phẩm
        return (
            <div className="row custom-row-gutters">
                {/* Cột trái: Hình ảnh (Đã cập nhật) */}
                <div className="col-6 position-relative text-center">
                    <img 
                        src={product.hinhanh || defaultImage} // <-- SỬ DỤNG ẢNH MỚI
                        alt={product.tenthuoc} 
                        className="img-fluid rounded product-modal-img" 
                    />
                </div>
                
                {/* Cột phải: Thông tin (Đã cập nhật) */}
                <div className="col-6 product-info-col">
                    <div className="d-flex align-items-center mb-2">
                        <small className="product-title-ship">Miễn phí vận chuyển cho mọi đơn hàng 0đ</small>
                    </div>
                    
                    <h4 className="product-name">{product.tenthuoc}</h4>
                    
                    {/* Phần giá (Đã cập nhật) */}
                    <div className="product-price-section my-3">
                        {product.giacu && product.giacu > 0 && (
                             <span className="product-price-old">
                                {formatPrice(product.giacu)}
                            </span>
                        )}
                        <span className="product-price-current">
                            {formatPrice(product.giaban)} / {product.donvitinh}
                        </span>
                    </div>

                    <p className="product-extra-info">Hoạt chất: {product.hoatchat}</p>
                    <hr />
                    
                    {/* Số lượng (Giữ nguyên) */}
                    <div className="d-flex align-items-center mb-4">
                        <span className="me-3">Số lượng</span>
                        <div className="input-group quantity-control">
                            <button className="btn btn-outline-secondary btn-qty" type="button" onClick={() => handleQuantityChange(-1)}>-</button>
                            <input type="text" className="form-control text-center input-qty" value={quantity} readOnly />
                            <button className="btn btn-outline-secondary btn-qty" type="button" onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>

                    {/* Nút bấm (Giữ nguyên) */}
                    <div className="d-grid gap-2">
                        <button className="btn_css btn-primary_css btn-mua-ngay" type="button">Mua ngay</button>
                        <button className="btn_css btn-them-gio" type="button" onClick={handleAddToCartClick}>Thêm vào giỏ</button>
                    </div>
                </div>
            </div>
        );
    };

    // Vỏ Modal (Giữ nguyên)
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