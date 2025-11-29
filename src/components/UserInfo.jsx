import React, { useState, useEffect } from 'react';

const UserInfo = () => {
    const [profile, setProfile] = useState({
        hoTen: '',
        sdt: '',
        email: '',
        ngaySinh: '', // Format: YYYY-MM-DD
        gioiTinh: 'Nam',
        anhDaiDien: '',
        matKhauCu: '',
        matKhauMoi: ''
    });
    const [loading, setLoading] = useState(true);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    // 1. Load dữ liệu khi vào trang
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch('http://localhost:5223/api/client/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Format ngày sinh để hiển thị trong input date (YYYY-MM-DD)
                    const formattedDate = data.ngaySinh ? data.ngaySinh.split('T')[0] : '';
                    setProfile({ ...data, ngaySinh: formattedDate, matKhauCu: '', matKhauMoi: '' });
                    setPreviewAvatar(data.anhDaiDien);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setProfile({ ...profile, [id]: value });
    };

    // 3. Xử lý chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, anhDaiDien: reader.result });
                setPreviewAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 4. Gửi cập nhật
    const handleUpdate = async () => {
        const token = localStorage.getItem('authToken');
        
        // Tạo payload, xử lý kỹ trường ngày tháng
        const payload = {
            ...profile,
            // Nếu ngày sinh rỗng, gửi null. Nếu có, giữ nguyên chuỗi YYYY-MM-DD
            ngaySinh: profile.ngaySinh === '' ? null : profile.ngaySinh,
            
            // Xử lý mật khẩu: nếu rỗng thì gửi null
            matKhauCu: profile.matKhauCu || null,
            matKhauMoi: profile.matKhauMoi || null
        };

        try {
            const res = await fetch('http://localhost:5223/api/client/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            // Đọc phản hồi JSON
            const data = await res.json();

            if (res.ok) {
                alert("Cập nhật thành công!");
                
                // Cập nhật tên trên Header (localStorage)
                const userStr = localStorage.getItem('appUser');
                if(userStr) {
                    const user = JSON.parse(userStr);
                    user.name = profile.hoTen;
                    localStorage.setItem('appUser', JSON.stringify(user));
                }
                
                // Xóa mật khẩu trên form sau khi đổi thành công
                setProfile(prev => ({ ...prev, matKhauCu: '', matKhauMoi: '' }));
                
                // Reload trang (hoặc không cần reload nếu state đã cập nhật)
                window.location.reload(); 
            } else {
                // --- XỬ LÝ HIỂN THỊ LỖI CHI TIẾT ---
                // Trường hợp 1: Lỗi logic (sai mật khẩu) có field "message"
                if (data.message) {
                    alert(data.message);
                } 
                // Trường hợp 2: Lỗi định dạng (Validation) có field "errors"
                else if (data.errors) {
                    // Gom tất cả lỗi lại thành 1 chuỗi để hiển thị
                    const errorMessages = Object.values(data.errors).flat().join('\n');
                    alert("Lỗi dữ liệu:\n" + errorMessages);
                } 
                // Trường hợp khác
                else {
                    alert("Có lỗi xảy ra, vui lòng thử lại.");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối đến Server");
        }
    };

    if (loading) return <div>Đang tải thông tin...</div>;

    // GIAO DIỆN GIỮ NGUYÊN CLASS NHƯ HTML GỐC
    return (
        <div className="CustomerContentPanel active">
            <h4 className="Customerinfo__name">Thông tin cá nhân</h4>
            <div className="Customerinfo__detail">
                <p className="Customerinfo__detail-title">Ảnh đại diện</p>
                <div className="Customerinfo__avatar">
                    {previewAvatar ? (
                        <img src={previewAvatar} alt="Avatar" style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}} />
                    ) : (
                        <i className="Customerinfo__avatar-icon fa-solid fa-circle-user" style={{fontSize: '80px', color: '#ccc'}}></i>
                    )}
                    
                    <label htmlFor="avatar-upload" className="Customerinfo__avatar-btn" style={{cursor: 'pointer', display: 'inline-block', textAlign: 'center', lineHeight: '30px'}}>
                        Cập nhật ảnh mới
                    </label>
                    <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleImageChange} />
                </div>

                <div className="Customerinfo__form">
                    <div className="Customerinfo__form-group">
                        <label htmlFor="hoTen" className="Customerinfo__form-label">Họ và tên</label>
                        <input 
                            type="text" 
                            className="Customerinfo__form-input" 
                            id="hoTen" 
                            value={profile.hoTen || ''} 
                            onChange={handleChange} 
                        />

                        <label htmlFor="ngaySinh" className="Customerinfo__form-label">Ngày sinh</label>
                        <div className="Customerinfo__form-input-wrapper">
                            <input 
                                type="date" 
                                className="Customerinfo__form-input" 
                                id="ngaySinh" 
                                value={profile.ngaySinh || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        <label htmlFor="gioiTinh" className="Customerinfo__form-label">Giới tính</label>
                        <select 
                            className="Customerinfo__form-input" 
                            id="gioiTinh" 
                            value={profile.gioiTinh} 
                            onChange={handleChange}
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className="Customerinfo__form-group Customerinfo__form-group--right">
                        <div className="Customerinfo__form-inforow">
                            <label className="Customerinfo__form-label">Số điện thoại</label>
                            {/* SĐT thường không cho sửa để định danh */}
                            <span className="Customerinfo__form-value" style={{color: '#888', background: '#f5f5f5', padding: '5px 10px', borderRadius: '4px', display: 'block', width: '100%'}}>
                                {profile.sdt}
                            </span>
                        </div>

                        <div className="Customerinfo__form-inforow" style={{marginTop: '15px'}}>
                            <label htmlFor="email" className="Customerinfo__form-label">Email</label>
                            <input 
                                type="email" 
                                className="Customerinfo__form-input" 
                                id="email" 
                                value={profile.email || ''} 
                                onChange={handleChange} 
                            />
                        </div>

                        {/* Phần đổi mật khẩu */}
                        <div style={{marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px'}}>
                            <span className="Customerinfo__form-subvalue" style={{fontWeight: 'bold', marginBottom: '10px', display: 'block'}}>Đổi mật khẩu (Bỏ trống nếu không đổi)</span>
                            
                            <label className="Customerinfo__form-label">Mật khẩu hiện tại</label>
                            <input 
                                type="password" 
                                className="Customerinfo__form-input" 
                                id="matKhauCu" 
                                value={profile.matKhauCu} 
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu cũ"
                            />

                            <label className="Customerinfo__form-label" style={{marginTop: '10px'}}>Mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="Customerinfo__form-input" 
                                id="matKhauMoi" 
                                value={profile.matKhauMoi} 
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                    </div>
                </div>
                
                <button 
                    className="Customerinfo__form-btn btn_css btn--primary_css" 
                    onClick={handleUpdate}
                    style={{marginTop: '20px'}}
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};

export default UserInfo;