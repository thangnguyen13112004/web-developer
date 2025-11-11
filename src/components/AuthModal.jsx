import React, { useState } from 'react';

// Đảm bảo cổng 5223 là đúng với API của bạn
const API_URL = 'http://localhost:5223/api/Auth'; 

// Nhận 3 props: show (để hiển thị), onClose (để đóng), onLoginSuccess (để báo App.jsx)
function AuthModal({ show, onClose, onLoginSuccess }) {
    const [isRegisterView, setIsRegisterView] = useState(false);
    
    // States cho form
    const [hoTen, setHoTen] = useState('');
    const [sdt, setSdt] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [error, setError] = useState(null); 

    // Hàm dọn dẹp form và đóng modal
    const handleClose = () => {
        setIsRegisterView(false);
        setError(null);
        setHoTen('');
        setSdt('');
        setMatKhau('');
        onClose(); // Gọi hàm onClose (chính là setShowAuthModal(false) của App.jsx)
    };

    // Hàm xử lý Đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sdt, matKhau })
            });

            const data = await response.json(); 

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            // ĐĂNG NHẬP THÀNH CÔNG
            // API (bước 4) đã trả về { token: "...", user: {...} }

            // 1. Lưu token và user vào localStorage
            localStorage.setItem('authToken', data.token); // <-- Dùng data.token
            localStorage.setItem('appUser', JSON.stringify(data.user)); // <-- Dùng data.user

            // 2. Báo cho App.jsx biết user VÀ token
            onLoginSuccess(data.user, data.token); // <-- SỬA LẠI: GỬI 2 THAM SỐ
            
            // 3. Tự động đóng modal
            handleClose(); 

        } catch (err) {
            setError(err.message);
        }
    };
    
    // Hàm xử lý Đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hoTen, sdt, matKhau })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }
            
            // Đăng ký thành công, reset form và chuyển sang tab Đăng nhập
            setIsRegisterView(false);
            setHoTen('');
            setSdt('');
            setMatKhau('');
            setError('Đăng ký thành công! Vui lòng đăng nhập.');

        } catch (err) {
            setError(err.message);
        }
    };

    // ----- JSX (Giao diện) -----

    const renderLogin = () => (
        <form onSubmit={handleLogin}>
            <div className="auth-form__form">
                <div className="auth-form__group">
                    <input type="text" className="auth-form__input" placeholder="Số điện thoại" value={sdt} onChange={(e) => setSdt(e.target.value)} required />
                </div>
                <div className="auth-form__group">
                    <input type="password" className="auth-form__input" placeholder="Mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} required />
                </div>
            </div>
            <div className="auth-form__controls">
                <button type="submit" className="btn btn--primary_css">ĐĂNG NHẬP</button>
            </div>
        </form>
    );

    const renderRegister = () => (
        <form onSubmit={handleRegister}>
            <div className="auth-form__form">
                <div className="auth-form__group">
                    <input type="text" className="auth-form__input" placeholder="Họ và tên" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required />
                </div>
                <div className="auth-form__group">
                    <input type="text" className="auth-form__input" placeholder="Số điện thoại" value={sdt} onChange={(e) => setSdt(e.target.value)} required />
                </div>
                <div className="auth-form__group">
                    <input type="password" className="auth-form__input" placeholder="Mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} required />
                </div>
            </div>
            <div className="auth-form__controls">
                <button type="submit" className="btn btn--primary_css">ĐĂNG KÝ</button>
            </div>
        </form>
    );

    // Vỏ Modal của Bootstrap
    return (
        <div 
            className={`modal fade ${show ? 'show d-block' : ''}`} 
            style={{ 
                backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent', 
                transition: 'none' // Tắt transition mặc định của Bootstrap
            }} 
            tabIndex="-1"
            onClick={handleClose} // Đóng khi click ra nền mờ
        >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content auth-form">
                    <button type="button" className="btn-close" onClick={handleClose}></button>
                    <div className="modal-header border-0 pb-0 auth-form__header">
                        <h3 className="auth-form__heading">{isRegisterView ? 'Đăng ký' : 'Đăng nhập'}</h3>
                        <span 
                            className="auth-form__switch-btn" 
                            onClick={() => setIsRegisterView(!isRegisterView)}
                        >
                            {isRegisterView ? 'Đăng nhập' : 'Đăng ký'}
                        </span>
                    </div>
                    
                    <div className="modal-body auth-form__container">
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        
                        {isRegisterView ? renderRegister() : renderLogin()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;