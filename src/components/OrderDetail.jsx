import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Hàm fetch dữ liệu (giữ nguyên logic cũ)
    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) { navigate('/'); return; }
            try {
                // Thêm timeStamp để tránh cache
                const res = await fetch(`http://localhost:5223/api/client/orders/${id}?t=${new Date().getTime()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    alert("Không tìm thấy đơn hàng");
                    navigate('/tai-khoan');
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchDetail();
    }, [id, navigate]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

    if (loading) return <div>Đang tải...</div>;
    if (!order) return null;

    // --- QUAN TRỌNG: BỎ APP__CONTAINER VÀ GRID ĐI, VÌ USERLAYOUT ĐÃ CÓ RỒI ---
    return (
        <div className="CustomerContentPanel active">
             {/* Header Breadcrumb */}
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#666' }}>
                <Link to="/tai-khoan" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', fontSize: '1.4rem' }}>
                    <i className="fa-solid fa-chevron-left" style={{ marginRight: '8px' }}></i>
                    TRỞ LẠI
                </Link>
                <span style={{ margin: '0 10px' }}>|</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '1.4rem' }}>
                    Chi tiết đơn hàng #{order.maDH} - <span style={{color: '#26aa99'}}>{order.trangThai}</span>
                </span>
            </div>

            {/* Nội dung chi tiết (Giữ nguyên style như ảnh cũ bạn muốn) */}
            <div style={{ background: '#fff', padding: '20px', borderTop: '4px solid #26aa99', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 1px 0 rgba(0,0,0,.05)' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.6rem', color: '#26aa99' }}>ĐƠN HÀNG {order.trangThai.toUpperCase()}</h4>
                    <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '1.4rem' }}>Cảm ơn bạn đã mua sắm tại Pharmacity</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', color: '#888' }}>Mã đơn hàng: <span style={{ color: '#333', fontWeight: 'bold' }}>{order.maDH}</span></div>
                    <div style={{ fontSize: '1.4rem', color: '#888' }}>Ngày đặt: {formatDate(order.ngayDat)}</div>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '25px', marginBottom: '15px', boxShadow: '0 1px 1px 0 rgba(0,0,0,.05)' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>Địa chỉ nhận hàng</h3>
                <div style={{ fontSize: '1.4rem', color: '#333', lineHeight: '1.8' }}>
                    <div style={{ fontWeight: 'bold' }}>{order.nguoiNhan}</div>
                    <div style={{ color: '#666' }}>{order.sdt}</div>
                    <div style={{ color: '#666' }}>{order.diaChiGiaoHang}</div>
                </div>
            </div>

            <div style={{ background: '#fff', boxShadow: '0 1px 1px 0 rgba(0,0,0,.05)' }}>
                {order.chiTiet.map((item, index) => (
                    <div key={index} style={{ display: 'flex', padding: '20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                        <img 
                            src={item.hinhAnh || 'https://placehold.co/80'} 
                            alt={item.tenThuoc} 
                            style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #e8e8e8' }} 
                        />
                        <div style={{ flex: 1, marginLeft: '15px' }}>
                            <div style={{ fontSize: '1.6rem', color: '#333', marginBottom: '5px' }}>{item.tenThuoc}</div>
                            <div style={{ fontSize: '1.4rem', color: '#888' }}>Phân loại: {item.donViTinh}</div>
                            <div style={{ fontSize: '1.4rem', color: '#888' }}>x{item.soLuong}</div>
                        </div>
                        <div style={{ fontSize: '1.6rem', color: '#ee4d2d', fontWeight: '500' }}>
                            {formatPrice(item.thanhTien)}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: '#fff', borderTop: '1px solid #f5f5f5', padding: '20px 25px 30px', boxShadow: '0 1px 1px 0 rgba(0,0,0,.05)' }}>
                <div style={{ width: '100%', maxWidth: '400px', marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.4rem', color: '#666' }}>
                        <span>Tổng tiền hàng</span>
                        <span>{formatPrice(order.tienHang)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.4rem', color: '#666' }}>
                        <span>Phí vận chuyển</span>
                        <span>{formatPrice(order.phiVanChuyen)}</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #eee', marginBottom: '20px' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '1.6rem', color: '#333', fontWeight: '500' }}>Tổng số tiền</span>
                        <span style={{ fontSize: '2.4rem', color: '#ee4d2d', fontWeight: 'bold' }}>{formatPrice(order.tongTien)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', color: '#333', borderTop: '1px dotted #ccc', paddingTop: '15px' }}>
                        <span>Phương thức thanh toán</span>
                        <span style={{ fontWeight: 'bold' }}>{order.phuongThucThanhToan}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;