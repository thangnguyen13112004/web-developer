import React from 'react'; // <-- BỎ `useState` và `useEffect`
import { Link } from 'react-router-dom'; // <-- THÊM DÒNG NÀY


// Hàm định dạng tiền tệ (copy từ ProductModal)
const formatPrice = (price) => {
    if (!price) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// 1. Nhận 3 props: currentUser, onLoginClick, onLogout
function Header({ currentUser, onLoginClick, onLogout, cart }) {

    // 1. Logic lấy tên hiển thị:
    // Backend trả về 'name', Database là 'hoten'. Code này sẽ nhận cả hai.
    const userName = currentUser ? (currentUser.hoten || currentUser.name || "Khách hàng") : "";

   

    // 2. KHÔNG CẦN state, KHÔNG CẦN useEffect
    // Dùng thẳng prop `currentUser`
    const loggedInUser = currentUser;

    // 3. Hàm đăng xuất (Giữ nguyên)
    // Sửa lại: Gọi hàm onLogout (của App.jsx)
    const handleLogout = () => {
        onLogout();
    };

    // 4. JSX Hiển thị thanh Navbar (chưa đăng nhập)
    const renderLoggedOutView = () => (
        <ul className="header__navbar-list">
            {/* (Icon Thông báo, Trợ giúp) */}
            <li className="header__navbar-item">
                <i className="header__navbar-icon fa-solid fa-bell"></i>
                <a href="" className="header__navbar-item-link">Thông báo</a>
            </li>
            <li className="header__navbar-item">
                <i className="header__navbar-icon fa-solid fa-question"></i>
                <a href="" className="header__navbar-item-link">Trợ giúp</a>
            </li>
            
            {/* Nút Đăng ký / Đăng nhập */}
            <li 
                className="header__navbar-item header__navbar-item--strong header__navbar-item--separate"
                onClick={onLoginClick} // Gọi hàm của App.jsx
                style={{cursor: 'pointer'}}
            >
                Đăng ký
            </li>
            <li 
                className="header__navbar-item header__navbar-item--strong"
                onClick={onLoginClick} // Gọi hàm của App.jsx
                style={{cursor: 'pointer'}}
            >
                Đăng nhập
            </li>
        </ul>
    );

    // 5. JSX Hiển thị thanh Navbar (ĐÃ đăng nhập) - ĐÃ CẬP NHẬT
    const renderLoggedInView = () => (
        <ul className="header__navbar-list">
            {/* (Icon Thông báo, Trợ giúp) */}
            <li className="header__navbar-item">
                <i className="header__navbar-icon fa-solid fa-bell"></i>
                <a href="" className="header__navbar-item-link">Thông báo</a>
            </li>
            <li className="header__navbar-item">
                <i className="header__navbar-icon fa-solid fa-question"></i>
                <a href="" className="header__navbar-item-link">Trợ giúp</a>
            </li>
            
            {/* THAY ĐỔI LỚN:
              Gộp thông tin User và menu Logout vào một thẻ `li`
              Class `header__navbar-user` sẽ là thẻ cha (tương tự .header__cart-wrap)
            */}
            <li className="header__navbar-item header__navbar-user header__navbar-item--separate">
                {/* Phần hiển thị tên user (giống icon giỏ hàng) */}
                <i className="header__navbar-icon fa-solid fa-circle-user"></i>
                <span className="header__navbar-user-name">Chào, {userName}</span>

                {/* Menu dropdown (tương tự .header__cart-list)
                  Chúng ta sẽ định nghĩa class CSS mới: .header__navbar-user-menu
                */}
                <ul className="header__navbar-user-menu">
                    {/* --- SỬA ĐOẠN NÀY --- */}
                    <li className="header__navbar-user-item">
                        {/* Link đến trang Thông tin cá nhân */}
                        <Link to="/thong-tin">Thông tin cá nhân</Link>
                    </li>
                    <li className="header__navbar-user-item">
                        {/* Link đến trang Lịch sử đơn hàng (CustomerProfile) */}
                        <Link to="/tai-khoan">Lịch sử đơn hàng</Link>
                    </li>
                    {/* ------------------- */}
                    
                    <li className="header__navbar-user-item">
                        <a href="#">Mã giảm giá</a>
                    </li>
                    <li className="header__navbar-user-item">
                        <a href="#">Sổ địa chỉ nhận hàng</a>
                    </li>
                    <li className="header__navbar-user-item header__navbar-user-item--separate">
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleLogout(); }}
                        >
                            Đăng xuất
                        </a>
                    </li>
                </ul>
            </li>

        </ul>
    );

    // 2. HÀM MỚI: Render nội dung giỏ hàng
    const renderCartBody = () => {
        if (!cart || cart.length === 0) {
            return (
                <>
                    <img src="./assets/img/no_cart.png" alt="" className="header__cart-no-cart-img" style={{display: 'block'}} />
                    <span className="header__cart-list-no-cart-msg" style={{display: 'block'}}>
                        Chưa có sản phẩm
                    </span>
                </>
            );
        }

        // Nếu có sản phẩm
        return (
            <>
                <h4 className="header__cart-heading">Sản phẩm đã thêm</h4>
                <ul className="header__cart-list-item">
                    {cart.map(item => (
                        <li className="header__cart-item" key={item.malo}> {/* Dùng malo làm key duy nhất */}
                            <img src={item.hinhanh || 'https://placehold.co/100x100'} alt={item.tenthuoc} className="header__cart-img" />
                            <div className="header__cart-item-info">
                                <div className="header__cart-item-head">
                                    <h5 className="header__cart-item-name">{item.tenthuoc}</h5>
                                    <div className="header__cart-item-price-wrap">
                                        <span className="header__cart-item-price">{formatPrice(item.dongia)}</span>
                                        <span className="header__cart-item-multiply">x</span>
                                        <span className="header__cart-item-qnt">{item.soluong}</span>
                                    </div>
                                </div>
                                <div className="header__cart-item-body">
                                    <span className="header__cart-item-description">
                                        Đơn vị: {item.donvitinh}
                                    </span>
                                    <span className="header__cart-item-remove">Xóa</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <Link to="/gio-hang" className="header__cart-view-cart btn_css btn--primary_css">
                    Xem giỏ hàng
                </Link>
            </>
        );
    };

    return (
        <header className="header">
            <div className="grid">
                <nav className="header__navbar">
                    {/* Navbar bên trái (Giữ nguyên) */}
                    <ul className="header__navbar-list">
                        <li className="header__navbar-item header__navbar-item--separate header__navbar--QR">
                            Vào cửa hàng trên ứng dụng F8-Shop
                            <div className="header__qr">
                                <img src="./assets/img/qr_code.png" alt="" className="header__qr-code" />
                                <div className="header__qr-apps">
                                    <a href="" className="header__qr-link">
                                        <img src="./assets/img/ch_play.png" alt="" className="header__qr-download" />
                                    </a>
                                    <a href="" className="header__qr-link">
                                        <img src="./assets/img/apple_store.png" alt="" className="header__qr-download" />
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li className="header__navbar-item">
                            <span className="header__navbar-item--no-pointer">Kết nối</span>
                            <a href="" className="header__navbar-icon-link">
                                <i className="header__navbar-icon fa-brands fa-facebook"></i>
                            </a>
                            <a href="" className="header__navbar-icon-link">
                                <i className="header__navbar-icon fa-brands fa-instagram"></i>
                            </a>
                        </li>
                    </ul>
    
                    {/* 6. Logic render chính:
                       Kiểm tra `loggedInUser` (từ prop)
                    */}
                    {loggedInUser ? renderLoggedInView() : renderLoggedOutView()}
                    
                </nav>

                {/* Header with search (Giữ nguyên) */}
                <div className="header-with-search">
                    <Link to="/" className="header__logo">
                        <img className="header__logo-img" src="https://prod-cdn.pharmacity.io/e-com/images/static-website/pharmacity-logo.svg" alt="Pharmacity Logo" />
                    </Link>
                    <div className="header__search">
                        <div className="header__search-input-wrap">
                            <input type="text" className="header__search-input" placeholder="Tìm kiếm sản phẩm" />
                            <div className="header__search-history">
                                <h3 className="header__search-history-heading">Lịch sử tìm kiếm</h3>
                                <ul className="header__search-history-list">
                                    <li className="header__search-history-item">
                                        <a href="">Kem dưỡng da</a>
                                    </li>
                                    <li className="header__search-history-item">
                                        <a href="">Son môi</a>
                                    </li>
                                    <li className="header__search-history-item">
                                        <a href="">Nước hoa hồng</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="header__search-select">
                            <span className="header__search-select-label">Trong shop</span>
                            <i className="header__search-select-icon fa-solid fa-angle-down"></i>
                            <ul className="header__search-option">
                                <li className="header__search-option-item header__search-option-item--active">
                                    <span>Trong shop</span>
                                    <i className="fa-solid fa-check"></i>
                                </li>
                                <li className="header__search-option-item">
                                    <span>Ngoài shop</span>
                                    <i className="fa-solid fa-check"></i>
                                </li>
                            </ul>
                        </div>
                        <button className="header__search-btn">
                            <i className="header__search-btn-icon fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div className="header__cart">
                        <div className="header__cart-wrap">
                            <i className="header__cart-icon fa-solid fa-cart-shopping"></i>
                            
                            {/* 4. Hiển thị số lượng sản phẩm (dùng cart.length) */}
                            {cart && cart.length > 0 && (
                                <span className="header-cart-notice">{cart.length}</span>
                            )}
                            
                            {/* 5. Gọi hàm renderCartBody */}
                            <div className="header__cart-list">
                                {renderCartBody()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>           
        </header>
    );
}

export default Header;