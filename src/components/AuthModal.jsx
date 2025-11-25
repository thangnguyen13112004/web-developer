import React, { useState } from 'react';

// Sửa lại cho đúng port API của bạn
const API_URL = 'http://localhost:5223/api/Auth'; 

function AuthModal({ show, onClose, onLoginSuccess }) {
    const [isRegisterView, setIsRegisterView] = useState(false);
    
    // LOGIN STATE: Dùng 'identifier' để chứa cả SĐT hoặc Tài khoản
    const [identifier, setIdentifier] = useState(''); 
    const [loginPass, setLoginPass] = useState('');

    // REGISTER STATE: Vẫn giữ nguyên logic cũ cho khách hàng
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPass, setRegPass] = useState('');

    const [error, setError] = useState(null); 

    const handleClose = () => {
        setIsRegisterView(false);
        setError(null);
        // Reset form inputs
        setIdentifier('');
        setLoginPass('');
        setRegName(''); setRegPhone(''); setRegPass('');
        onClose(); 
    };

    // --- XỬ LÝ ĐĂNG NHẬP ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Gửi 'Identifier' thay vì 'Sdt' để khớp với DTO bên C#
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier, matKhau: loginPass }) 
            });

            const data = await response.json(); 

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            // Gọi callback để App.jsx xử lý tiếp (lưu token, chuyển trang...)
            onLoginSuccess(data.user, data.token);
            
            // Đóng modal nhưng không reset ngay để user thấy mượt
            onClose(); 

        } catch (err) {
            setError(err.message);
        }
    };

    // --- XỬ LÝ ĐĂNG KÝ (Chỉ cho Khách hàng) ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hoTen: regName, sdt: regPhone, matKhau: regPass })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }
            
            // Đăng ký thành công -> Chuyển qua view Đăng nhập
            setIsRegisterView(false);
            setIdentifier(regPhone); // Điền sẵn SĐT vừa đăng ký vào ô đăng nhập
            setRegName(''); setRegPhone(''); setRegPass('');
            setError('Đăng ký thành công! Vui lòng đăng nhập.');

        } catch (err) {
            setError(err.message);
        }
    };

    // --- GIAO DIỆN FORM ĐĂNG NHẬP ---
    const renderLogin = () => (
        <form onSubmit={handleLogin}>
            <div className="auth-form__form">
                <div className="auth-form__group">
                    {/* Input này chấp nhận cả SĐT và Tài khoản Admin */}
                    <input 
                        type="text" 
                        className="auth-form__input" 
                        placeholder="Số điện thoại / Tài khoản" 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        required 
                    />
                </div>
                <div className="auth-form__group">
                    <input 
                        type="password" 
                        className="auth-form__input" 
                        placeholder="Mật khẩu" 
                        value={loginPass} 
                        onChange={(e) => setLoginPass(e.target.value)} 
                        required 
                    />
                </div>
            </div>
            <div className="auth-form__controls">
                <button type="submit" className="btn btn--primary_css">ĐĂNG NHẬP</button>
            </div>
        </form>
    );

    // --- GIAO DIỆN FORM ĐĂNG KÝ ---
    const renderRegister = () => (
        <form onSubmit={handleRegister}>
            <div className="auth-form__form">
                <div className="auth-form__group">
                    <input type="text" className="auth-form__input" placeholder="Họ và tên" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                </div>
                <div className="auth-form__group">
                    <input type="text" className="auth-form__input" placeholder="Số điện thoại" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                </div>
                <div className="auth-form__group">
                    <input type="password" className="auth-form__input" placeholder="Mật khẩu" value={regPass} onChange={(e) => setRegPass(e.target.value)} required />
                </div>
            </div>
            <div className="auth-form__controls">
                <button type="submit" className="btn btn--primary_css">ĐĂNG KÝ</button>
            </div>
        </form>
    );

    // --- RENDER MODAL CHÍNH ---
    return (
        <div 
            className={`modal fade ${show ? 'show d-block' : ''}`} 
            style={{ 
                backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent', 
                transition: 'none'
            }} 
            tabIndex="-1"
            onClick={handleClose}
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
                        {error && (
                            <div className={`alert ${error.includes('thành công') ? 'alert-success' : 'alert-danger'}`} role="alert">
                                {error}
                            </div>
                        )}
                        
                        {isRegisterView ? renderRegister() : renderLogin()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;