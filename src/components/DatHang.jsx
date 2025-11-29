import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddressModal from './AddressModal.jsx'; // 1. Import modal

// --- IMPORT ẢNH TẠI ĐÂY ---
import momoImg from '../assets/img/payment/momo_logo.svg';
import zalopayImg from '../assets/img/payment/zalopay_logo.png';
import creditCardImg from '../assets/img/payment/creditcard_icon.png';
import atmImg from '../assets/img/payment/atm_icon.png';
import applePayImg from '../assets/img/payment/applepay_logo.png';
// ---------------------------

// Hàm helper
const getAuthToken = () => localStorage.getItem('authToken');
const formatPrice = (price) => {
    if (typeof price !== 'number') return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function DatHang({ cart, currentUser, onOrderPlaced }) {
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false); // 2. State để mở/đóng modal
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const location = useLocation(); // Hook lấy dữ liệu truyền từ GioHang

    // Ưu tiên lấy items từ state (nếu được truyền từ Giỏ hàng hoặc Mua ngay), nếu không thì lấy toàn bộ cart
    const itemsToCheckout = location.state?.selectedItems || cart;

    const fetchDefaultAddress = async () => {
        setLoadingAddress(true);
        const token = getAuthToken();
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5223/api/SoDiaChi/default', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setDefaultAddress(await res.json());
            } else {
                setDefaultAddress(null); 
            }
        } catch (e) {
            console.error("Lỗi khi tải địa chỉ mặc định:", e); // <-- SỬ DỤNG 'e'
            setDefaultAddress(null);
        }
        setLoadingAddress(false);
    };

    // Tải địa chỉ khi component mount
    useEffect(() => {
        fetchDefaultAddress();
    }, [currentUser]);

    // Xử lý "Đặt Hàng"
    const handlePlaceOrder = async () => {
        if (!defaultAddress) {
            alert("Vui lòng thêm địa chỉ giao hàng.");
            return;
        }
        
        const token = getAuthToken();
        // Lấy danh sách MaLo để gửi về server
        const selectedMalos = itemsToCheckout.map(item => item.malo);
        try {
            const res = await fetch('http://localhost:5223/api/DatHang', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // <--- QUAN TRỌNG: THÊM DÒNG NÀY ĐỂ SỬA LỖI 415
                },
                // Gửi dữ liệu thật khớp với CheckoutDto ở Backend
                body: JSON.stringify({ 
                    maDC: defaultAddress.madc,   // Lấy ID địa chỉ
                    phuongThucTT: paymentMethod,  // Lấy phương thức thanh toán từ state
                    selectedMalos: selectedMalos // <--- GỬI DANH SÁCH ID ĐÃ CHỌN
                }) 
            });

            if(res.ok) {
                const data = await res.json(); // API trả về { message, orderId }
            
                alert("Đặt hàng thành công!");
                onOrderPlaced(); // Xóa giỏ hàng
                
                // Chuyển hướng đến trang Lịch sử đơn hàng
                navigate(`/tai-khoan/don-hang/${data.orderId}`);
            } else {
                const err = await res.json();
                alert("Lỗi khi đặt hàng: " + (err.message || "Có lỗi xảy ra"));
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server");
        }
    };
    
    // Tính toán lại tổng tiền dựa trên itemsToCheckout
    const tamTinh = itemsToCheckout.reduce((total, item) => (item.giacu || item.dongia) * item.soluong + total, 0);
    const giamGiaSanPham = itemsToCheckout.reduce((total, item) => total + ((item.giacu || item.dongia) - item.dongia) * item.soluong, 0);
    const tongTien = tamTinh - giamGiaSanPham;
    const soLuongTong = itemsToCheckout.reduce((total, item) => total + item.soluong, 0);

    // JSX render phần địa chỉ (Render có điều kiện)
    const renderDeliveryInfo = () => {
        if (loadingAddress) return <div className="order__infor order__delivery"><p>Đang tải địa chỉ...</p></div>;

        if (!defaultAddress) {
            return (
                <div className="order__infor order__delivery">
                    <h4 className="order__delivery-title">Hình thức nhận hàng</h4>
                    {/* Nút này sẽ mở modal (logic từ HTML) */}
                    <button className="order__delivery-update" onClick={() => setShowAddressModal(true)}>
                        + Cập nhật địa chỉ nhận hàng
                    </button>
                    <p>Bạn chưa có địa chỉ, vui lòng thêm địa chỉ để đặt hàng.</p>
                </div>
            );
        }

        // NẾU CÓ ĐỊA CHỈ
        return (
            <div className="order__infor order__delivery">
                <div className="order__delivery-header">
                    <h4 className="order__delivery-title">Thông tin người nhận</h4>
                </div>
                <div className="order__delivery-user-info">
                    <div className="order__delivery-user-details">
                        <span className="user-name">{defaultAddress.hotenNhan}</span>
                        <span className="user-phone">{defaultAddress.sdtNhan}</span>
                        <span className="user-address">
                            {`${defaultAddress.sonhaDuong}, ${defaultAddress.phuongxa}, ${defaultAddress.quanhuyen}, ${defaultAddress.tinhthanh}`}
                        </span>
                        <div className="user-tags">
                            {defaultAddress.loaidc && <span className="user-tag tag-type">{defaultAddress.loaidc}</span>}
                            {defaultAddress.macdinh && <span className="user-tag tag-default">Mặc định</span>}
                        </div>
                    </div>
                    
                    {/* ========================================================== */}
                    {/* ĐÂY LÀ DÒNG ĐÃ SỬA: DÙNG <SPAN> VỚI STYLE DẤU NGOẶC NHỌN KÉP */}
                    {/* ========================================================== */}
                    <span 
                        className="order__delivery-change-link" 
                        onClick={() => setShowAddressModal(true)}
                        style={{ cursor: 'pointer' }} 
                    >
                        Thay đổi
                    </span>
                    
                </div>
            </div>
        );
    };

    return (
        <div className="app__container">
            <div className="grid">
                <div className="grid__row app__content">
                    {/* Cột trái (9) */}
                    <div className="grid__column-9">
                        <div className="order__infor">
                            <h2 className="order__infor-title">Thanh toán</h2>
                            <ul className="order__infor-list-item">
                                {itemsToCheckout.map(item => (
                                    <li className="order__infor-item" key={item.malo}>
                                        <img src={item.hinhanh || 'https://placehold.co/100x100'} alt={item.tenthuoc} className="order__infor-img" />
                                        <div className="order__infor-item-info">
                                            <div className="order__infor-item-head"><h5 className="order__infor-item-name">{item.tenthuoc}</h5></div>
                                            <div className="order__infor-item-body">
                                                <span className="order__infor-item-description">{item.donvitinh}</span>
                                                <div className="order__infor-item-price-wrap">
                                                    <span className="order__infor-item-qnt">x{item.soluong}</span>
                                                    {item.giacu && <span className="order__infor-item-lastprice">{formatPrice(item.giacu)}</span>}
                                                    <span className="order__infor-item-currentprice">{formatPrice(item.dongia)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {renderDeliveryInfo()}

                        {/* (Copy HTML tĩnh của Phương thức thanh toán) */}
                        <div className="order__infor order__paymentmethod">
                            <h4 className="order__paymentmethod-title">Phương thức thanh toán</h4>
                            <div className="payment-method-list">
                                {/* 1. Tiền mặt (COD) */}
                                <label className="payment-method-item" htmlFor="payment-cod">
                                    <input 
                                        type="radio" 
                                        id="payment-cod" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="cod" 
                                        checked={paymentMethod === 'cod'} // Kiểm tra state
                                        onChange={(e) => setPaymentMethod(e.target.value)} // Cập nhật state
                                    />
                                    <span className="payment-method-logo cod-logo">COD</span>
                                    <span className="payment-method-label">Tiền mặt</span>
                                </label>

                                {/* 2. Momo */}
                                <label className="payment-method-item" htmlFor="payment-momo">
                                    <input 
                                        type="radio" 
                                        id="payment-momo" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="momo" 
                                        checked={paymentMethod === 'momo'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src={momoImg} alt="Momo" className="payment-method-logo" /> 
                                    <span className="payment-method-label">Momo</span>
                                </label>

                                {/* 3. ZaloPay */}
                                <label className="payment-method-item" htmlFor="payment-zalopay">
                                    <input 
                                        type="radio" 
                                        id="payment-zalopay" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="zalopay"
                                        checked={paymentMethod === 'zalopay'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src={zalopayImg} alt="ZaloPay" className="payment-method-logo" />
                                    <span className="payment-method-label">ZaloPay</span>
                                </label>

                                {/* 4. Thẻ tín dụng */}
                                <label className="payment-method-item" htmlFor="payment-creditcard">
                                    <input 
                                        type="radio" 
                                        id="payment-creditcard" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="creditcard"
                                        checked={paymentMethod === 'creditcard'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src={creditCardImg} alt="Thẻ tín dụng" className="payment-method-logo" />
                                    <span className="payment-method-label">Thẻ tín dụng</span>
                                </label>

                                {/* 5. ATM */}
                                <label className="payment-method-item" htmlFor="payment-atm">
                                    <input 
                                        type="radio" 
                                        id="payment-atm" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="atm"
                                        checked={paymentMethod === 'atm'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src={atmImg} alt="Thẻ ATM" className="payment-method-logo" />
                                    <span className="payment-method-label">Thẻ ATM</span>
                                </label>

                                {/* 6. Apple Pay */}
                                <label className="payment-method-item" htmlFor="payment-applepay">
                                    <input 
                                        type="radio" 
                                        id="payment-applepay" 
                                        name="payment-method" 
                                        className="payment-method-radio" 
                                        value="applepay"
                                        checked={paymentMethod === 'applepay'} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src={applePayImg} alt="Apple Pay" className="payment-method-logo" />
                                    <span className="payment-method-label">Apple Pay</span>
                                </label>
                            </div>
                        </div>
                    </div>
    
                    {/* Cột phải (3) */}
                    <div className="grid__column-3">
                        <div className="order__infor order__detail">
                            <h4 className="order__detail-title">Chi tiết thanh toán</h4>
                            <div className="order__detail-content">
                                <div className="order__detail-item">
                                    <span className="order__detail-item-label">Tạm tính</span>
                                    <span className="order__detail-item-value">{formatPrice(tamTinh)}</span>
                                </div>
                                <div className="order__detail-item">
                                    <span className="order__detail-item-label">Giảm giá sản phẩm</span>
                                    <span className="order__detail-item-value">{formatPrice(giamGiaSanPham > 0 ? -giamGiaSanPham : 0)}</span>
                                </div>
                                <div className="order__detail-item order__detail-item--total">
                                    <div className="order__detail-item-label"><p className="order__detail-item-label1">Tổng tiền</p></div>
                                    <span className="order__detail-item-value1">{formatPrice(tongTien)}</span>
                                </div>
                                <button 
                                    className="order__detail-btn btn_css btn--primary_css" 
                                    disabled={!defaultAddress || cart.length === 0} // Vô hiệu hóa nếu không có địa chỉ
                                    onClick={handlePlaceOrder}
                                >
                                    Đặt hàng ({soLuongTong})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 3. Render Modal (Render có điều kiện) */}
            {showAddressModal && (
                <AddressModal 
                    show={showAddressModal} 
                    onClose={() => setShowAddressModal(false)}
                    onAddressChanged={fetchDefaultAddress} // Callback
                />
            )}
        </div>
    );
}

export default DatHang;