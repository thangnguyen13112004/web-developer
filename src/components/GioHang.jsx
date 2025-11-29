import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
    if (typeof price !== 'number') return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function GioHang({ cart, onUpdateQuantity, onRemoveItem }) {

    // 1. State để quản lý các sản phẩm được chọn
    const [selectedMalos, setSelectedMalos] = useState([]);

    // 2. Khi giỏ hàng (prop) thay đổi, tự động chọn tất cả
    useEffect(() => {
        setSelectedMalos(cart.map(item => item.malo));
    }, [cart]);

    // 3. Lọc ra các sản phẩm đã được chọn
    const selectedItems = cart.filter(item => selectedMalos.includes(item.malo));

    // 4. Logic tính toán (DỰA TRÊN CÁC SẢN PHẨM ĐƯỢC CHỌN)
    
    // Tạm tính là tổng GIÁ GỐC (giacu)
    const tamTinh = selectedItems.reduce((total, item) => {
        const originalPrice = item.giacu || item.dongia; // Nếu không có giacu, dùng dongia
        return total + (originalPrice * item.soluong);
    }, 0);

    // Giảm giá sản phẩm = (Giá gốc - Giá bán) * số lượng
    const giamGiaSanPham = selectedItems.reduce((total, item) => {
        const originalPrice = item.giacu || item.dongia;
        const discount = (originalPrice - item.dongia) * item.soluong;
        return total + (discount > 0 ? discount : 0); // Chỉ cộng nếu có giảm giá
    }, 0);

    const giamGiaUuDai = 0; // Tạm thời, logic voucher
    
    // Tổng tiền cuối cùng
    const tongTien = tamTinh - giamGiaSanPham - giamGiaUuDai;

    // Tổng số lượng (cho nút Mua hàng)
    const soLuongTong = selectedItems.reduce((total, item) => total + item.soluong, 0);

    // 5. Logic cho Checkbox
    const handleSelectOne = (malo) => {
        setSelectedMalos(prev => 
            prev.includes(malo) 
                ? prev.filter(m => m !== malo) // Bỏ chọn
                : [...prev, malo] // Chọn
        );
    };

    const isAllSelected = cart.length > 0 && selectedMalos.length === cart.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedMalos([]); // Bỏ chọn tất cả
        } else {
            setSelectedMalos(cart.map(item => item.malo)); // Chọn tất cả
        }
    };

    // 6. Xử lý khi số lượng = 0 (gọi hàm xóa)
    const handleQuantityClick = (item, amount) => {
        const newQuantity = item.soluong + amount;
        if (newQuantity < 1) {
            // Thay vì gọi onUpdate, gọi onRemove
            onRemoveItem(item.malo);
        } else {
            onUpdateQuantity(item.malo, newQuantity);
        }
    };


    return (
        <div className="app__container">
            <div className="grid">
                <div className="grid__row app__content">
                    {/* Cột trái (9) */}
                    <div className="grid__column-9">
                        <div className="cart__info">

                            <div className="cart__info-title">
                                <span className="cart__title-name">Giỏ hàng ({cart.length})</span>
                                {/* (Nâng cao): <span className="cart__title-remove">Xóa</span> */}
                            </div>
                            
                            <div className="cart__header">
                                <div className="cart__col-product">
                                    <input 
                                        type="checkbox" 
                                        className="cart__checkbox" 
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                    Sản phẩm
                                </div>
                                <div className="cart__col-price">Đơn giá</div>
                                <div className="cart__col-quantity">Số lượng</div>
                                <div className="cart__col-total-action">Thành tiền</div>
                            </div>

                            {/* 7. Dùng .map() để lặp qua (cart) đầy đủ */}
                            {cart.map(item => (
                                <div className="cart__item" key={item.malo}>
                                    <div className="cart__col-product">
                                        <input 
                                            type="checkbox" 
                                            className="cart__checkbox" 
                                            checked={selectedMalos.includes(item.malo)}
                                            onChange={() => handleSelectOne(item.malo)}
                                        />
                                        <img src={item.hinhanh || 'https://placehold.co/100x100'} alt={item.tenthuoc} className="cart__img" />

                                        <div className="cart__details">
                                            <h5 className="cart__name">{item.tenthuoc}</h5>
                                            <div className="cart__type">Đơn vị: {item.donvitinh}</div>
                                        </div>
                                    </div>

                                    {/* SỬA LẠI: HIỂN THỊ CẢ GIÁ CŨ VÀ MỚI */}
                                    <div className="cart__col-price">
                                        {item.giacu && item.giacu > item.dongia && (
                                            <span className="cart__price-old">{formatPrice(item.giacu)}</span>
                                        )}
                                        <span className="cart__price-current">{formatPrice(item.dongia)}</span>
                                    </div>

                                    <div className="cart__col-quantity">
                                        <button 
                                            className="cart__btn"
                                            onClick={() => handleQuantityClick(item, -1)}
                                        >−</button>
                                        <span className="cart__qnt">{item.soluong}</span>
                                        <button 
                                            className="cart__btn"
                                            onClick={() => handleQuantityClick(item, 1)}
                                        >+</button>
                                    </div>

                                    <div className="cart__col-total-action">
                                        <span className="cart__total">{formatPrice(item.dongia * item.soluong)}</span>
                                        <i 
                                            className="fa-solid fa-trash cart__trash"
                                            onClick={() => onRemoveItem(item.malo)} // Luôn gọi hàm xóa
                                        ></i>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
    
                    {/* Cột phải (3) */}
                    <div className="grid__column-3">
                        <div className="cart__promo-box">
                            <span>
                                <i className="fa-solid fa-ticket cart__promo-icon"></i>
                                Khuyến mãi
                            </span>
                            <a href="#" className="cart__promo-link">Chọn mã</a>
                        </div>
                        
                        <div className="order__infor cart__detail">
                            <div className="cart__detail-content">
                                
                                {/* SỬA LẠI LOGIC TÍNH TIỀN */}
                                <div className="cart__detail-item">
                                    <span className="cart__detail-item-label">Tạm tính</span>
                                    <span className="cart__detail-item-value">{formatPrice(tamTinh)}</span>
                                </div>

                                <div className="cart__detail-item">
                                    <span className="cart__detail-item-label">Giảm giá sản phẩm</span>
                                    <span className="cart__detail-item-value">{formatPrice(giamGiaSanPham > 0 ? -giamGiaSanPham : 0)}</span>
                                </div>
                                
                                <div className="cart__detail-item">
                                    <span className="cart__detail-item-label">Giảm giá ưu đãi</span>
                                    <span className="cart__detail-item-value">{formatPrice(giamGiaUuDai > 0 ? -giamGiaUuDai : 0)}</span>
                                </div>


                                <div className="cart__detail-item cart__detail-item--total">
                                    <div className="cart__detail-item-label">
                                        <p className="cart__detail-item-label1">Tổng tiền</p>
                                    </div>
                                    <span className="cart__detail-item-value1">{formatPrice(tongTien)}</span>
                                </div>

                                <Link 
                                    to={selectedItems.length > 0 ? "/dat-hang" : "#"} 
                                    state={{ selectedItems: selectedItems }} // <--- TRUYỀN DANH SÁCH CHỌN SANG DAT HANG
                                    className={`cart__detail-btn btn_css btn--primary_css ${selectedItems.length === 0 ? 'disabled' : ''}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    Mua hàng ({soLuongTong})
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GioHang;