import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
    const [orderStatusTab, setOrderStatusTab] = useState('Tất cả');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const STATUS_TABS = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đã đóng gói', 'Đang giao', 'Hoàn tất', 'Đã hủy'];

    const fetchOrders = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) { navigate('/'); return; }

        try {
            // Thêm timestamp vào URL để tránh browser cache kết quả cũ
            const res = await fetch(`http://localhost:5223/api/client/orders?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetch khi component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (orderStatusTab === 'Tất cả') return true;
        return order.trangThai === orderStatusTab;
    });

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // CSS Badge trạng thái động
    const getStatusStyle = (status) => {
        if (status === 'Hoàn tất') return { backgroundColor: '#EBF3FA', color: '#1B51A6' }; // Xanh dương nhạt
        if (status === 'Đã hủy') return { backgroundColor: '#ffeaea', color: '#d32f2f' }; // Đỏ
        if (status === 'Đã đóng gói') return { backgroundColor: '#fff8e1', color: '#f57c00' }; // Cam
        return {}; // Mặc định
    };

    return (
        <div className="CustomerContentPanel active">
            <div className="OrderHistory__wrapper">
                <div className="OrderHistory__header">
                    <h3 className="OrderHistory__title">Lịch sử đơn hàng</h3>
                    {/* Nút Refresh thủ công để check trạng thái */}
                    <button onClick={fetchOrders} className="btn_css" style={{padding: '5px 10px', fontSize: '1.2rem', marginLeft: 'auto'}}>
                        <i className="fa-solid fa-rotate-right"></i> Làm mới
                    </button>
                </div>

                <nav className="order-history-nav">
                    <ul>
                        {STATUS_TABS.map(status => (
                            <li 
                                key={status} 
                                className={`js-order-tab ${orderStatusTab === status ? 'active' : ''}`}
                                onClick={() => setOrderStatusTab(status)}
                            >
                                <a>{status}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div className="order-history-panels" style={{marginTop: '20px'}}>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="order-empty-state">
                             <img src="https://prod-cdn.pharmacity.io/e-com/images/static-website/20240706155228-0-empty-order-history.svg" alt="Empty" />
                            <h4>Không có đơn hàng nào</h4>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div className="order-card" key={order.maDH}>
                                <div className="order-card-header">
                                    <span className="order-status-badge" style={getStatusStyle(order.trangThai)}>
                                        {order.trangThai}
                                    </span>
                                    <span className="order-date">
                                        #{order.maDH} - {new Date(order.ngayDat).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                
                                <div className="order-card-body">
                                    <p className="order-location">Ngày đặt: {new Date(order.ngayDat).toLocaleDateString('vi-VN')}</p>
                                    
                                    {/* Map sản phẩm - CLICK VÀO ĐÂY SẼ SANG CHI TIẾT */}
                                    {order.chiTiet.map((item, idx) => (
                                        <Link 
                                            to={`/tai-khoan/don-hang/${order.maDH}`} 
                                            key={idx} 
                                            className="order-product-item" 
                                            style={{textDecoration: 'none', color: 'inherit', cursor: 'pointer'}}
                                        >
                                            <img src={item.hinhAnh || 'https://placehold.co/80'} alt={item.tenThuoc} />
                                            <div className="product-info">
                                                <p className="product-name">{item.tenThuoc}</p>
                                                <p className="product-variant">{item.donViTinh} x{item.soLuong}</p>
                                            </div>
                                            <span className="product-price">{formatPrice(item.donGia)}</span>
                                        </Link>
                                    ))}
                                </div>
                                
                                <div className="order-card-footer">
                                    {/* Hiển thị Tổng tiền */}
                                    <div className="order-total">
                                        <span>Tổng tiền:</span>
                                        <span className="total-price" style={{ marginLeft: '8px', color: '#ee4d2d', fontSize: '1.6rem', fontWeight: 'bold' }}>
                                            {formatPrice(order.tongTien)}
                                        </span>
                                    </div>

                                    {/* Khu vực các nút bấm (Hủy đơn / Xem chi tiết) */}
                                    <div style={{ marginTop: '10px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        
                                        {/* LOGIC HIỂN THỊ NÚT HỦY: Chỉ hiện khi đơn mới đặt hoặc đang xử lý */}
                                        {(order.trangThai === 'Chờ xử lý' || order.trangThai === 'Đang xử lý') && (
                                            <button
                                                className="btn_css"
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #d32f2f',
                                                    color: '#d32f2f',
                                                    padding: '8px 20px',
                                                    fontSize: '1.4rem',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={async () => {
                                                    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
                                                        const token = localStorage.getItem('authToken');
                                                        try {
                                                            const res = await fetch(`http://localhost:5223/api/client/orders/${order.maDH}/cancel`, {
                                                                method: 'PUT',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });

                                                            if (res.ok) {
                                                                alert('Đã hủy đơn hàng thành công');
                                                                fetchOrders(); // Tải lại danh sách để cập nhật trạng thái
                                                            } else {
                                                                const err = await res.json();
                                                                alert(err.message || 'Lỗi khi hủy đơn');
                                                            }
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert('Lỗi kết nối server');
                                                        }
                                                    }
                                                }}
                                            >
                                                Hủy đơn hàng
                                            </button>
                                        )}

                                        {/* Nút Xem chi tiết */}
                                        <Link
                                            to={`/tai-khoan/don-hang/${order.maDH}`}
                                            className="btn_css btn--primary_css"
                                            style={{
                                                textDecoration: 'none',
                                                padding: '8px 24px',
                                                fontSize: '1.4rem',
                                                display: 'inline-block' // Đảm bảo padding hoạt động tốt trên thẻ a
                                            }}
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div> 
            </div>
        </div> 
    );
};

export default CustomerProfile;