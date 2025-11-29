import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const UserLayout = () => {
    const location = useLocation();
    
    // Kiểm tra đường dẫn để active menu
    const isHistoryActive = location.pathname.includes('/tai-khoan');
    const isInfoActive = location.pathname.includes('/thong-tin');

    return (
        <div className="app__container">
            <div className="grid">
                <div className="grid__row app__content" style={{paddingTop: '20px'}}>
                    
                    {/* --- SIDEBAR TRÁI (CỐ ĐỊNH) --- */}
                    <div className="grid__column-3">
                        <div className="Customer__info">
                            <div className="Customer__title">
                                <i className="Customer__title-icon fa-solid fa-circle-user"></i>
                                <h3 className="Customer__title-name">Tài khoản của tôi</h3>
                            </div>

                            <Link to="/thong-tin" className={`Customer__nav-item ${isInfoActive ? 'active' : ''}`} style={{textDecoration: 'none'}}>
                                <i className="Customer__nav-icon fa-regular fa-circle-user"></i>
                                <h3 className="Customer__nav-text">Thông tin cá nhân</h3>
                            </Link>

                            <Link to="/tai-khoan" className={`Customer__nav-item ${isHistoryActive ? 'active' : ''}`} style={{textDecoration: 'none'}}>
                                <i className="Customer__nav-icon fa-regular fa-rectangle-list"></i>
                                <h3 className="Customer__nav-text">Lịch sử đơn hàng</h3>
                            </Link>
                        </div>
                    </div>
                    
                    {/* --- CONTENT PHẢI (THAY ĐỔI DỰA VÀO ROUTE CON) --- */}
                    <div className="grid__column-9">
                        {/* <Outlet /> là nơi React Router render component con (Danh sách hoặc Chi tiết) */}
                        <Outlet />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserLayout;