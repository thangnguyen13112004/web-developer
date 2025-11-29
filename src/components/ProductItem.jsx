import React from 'react';
import { Link } from 'react-router-dom';

function ProductItem({ product, onProductSelect }) {
    
    const formatPrice = (price) => {
        if (!price) return 'Đang cập nhật';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    const defaultImage = 'https://placehold.co/300x300/EBF3FA/1B51A6?text=Pharmacity';

    // ===================================================================
    // BẮT ĐẦU LOGIC GIẢM GIÁ
    // ===================================================================
    
    // 1. Kiểm tra xem có giảm giá không
    const hasDiscount = product.giacu && product.giacu > product.giaban;
    
    // 2. Tính toán phần trăm (nếu có)
    let discountPercent = 0;
    if (hasDiscount) {
        // ( (Giá cũ - Giá mới) / Giá cũ ) * 100
        const diff = product.giacu - product.giaban;
        discountPercent = Math.round((diff / product.giacu) * 100);
    }
    
    // ===================================================================
    // KẾT THÚC LOGIC GIẢM GIÁ
    // ===================================================================

    return (
        <div className="grid__column-2-4">
            <div className="home-product-item">
                
                <Link to={`/san-pham/${product.mathuoc}`} style={{textDecoration: 'none'}}>
                    <div 
                        className="home-product-item__img" 
                        style={{ backgroundImage: `url(${product.hinhanh || defaultImage})` }}
                    ></div>
                </Link>

                <h4 className="home-product-item__name">
                    <Link to={`/san-pham/${product.mathuoc}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {product.tenthuoc}
                    </Link>
                </h4>

                <div className="home-product-item__price">
                    {/* Hiển thị giá cũ (nếu có) */}
                    {hasDiscount && (
                        <span className="home-product-item__price-old">
                            {formatPrice(product.giacu)}
                        </span>
                    )}
                    
                    <span className="home-product-item__price-current">
                        {formatPrice(product.giaban)}
                    </span>
                </div>

                <div className="home-product-item__origin">
                    <button 
                        className="home-product-item__button btn_css btn--primary_css" 
                        data-bs-toggle="modal" 
                        data-bs-target="#productModal"
                        onClick={() => onProductSelect(product.mathuoc)}
                    >
                        Chọn sản phẩm
                    </button>

                    {/* 2. Nút bấm: Nếu hết hàng thì Disable và đổi chữ */}
                    {/* <button 
                        className={`btn-add-cart ${isOutOfStock ? 'disabled' : ''}`}
                        onClick={() => !isOutOfStock && onProductSelect(product.mathuoc)}
                        disabled={isOutOfStock} // Khoá nút lại
                        style={{ 
                            backgroundColor: isOutOfStock ? '#ccc' : '#007bff',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isOutOfStock ? "Sắp có hàng" : "Chọn sản phẩm"}
                    </button> */}
                </div>

                {/* =================================================================== */}
                {/* 3. HIỂN THỊ TAG GIẢM GIÁ NẾU CÓ */}
                {/* Chỉ render khối div này KHI `hasDiscount` là true */}
                {/* =================================================================== */}
                {hasDiscount && (
                    <div className="home-product-item__favourite">
                        <i className="fa-solid fa-check"></i>
                        <span> Giảm {discountPercent}% </span>
                    </div>
                )}
                
            </div>
        </div>
    );
}

export default ProductItem;