import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select'; 

// Hàm helper
const getAuthToken = () => localStorage.getItem('authToken');
const API_URL = 'http://localhost:5223/api/SoDiaChi';
const PROVINCE_API_URL = 'https://provinces.open-api.vn/api';

// State rỗng
const EMPTY_FORM = {
    hotenNhan: '', sdtNhan: '', tinhthanh: '', quanhuyen: '',
    phuongxa: '', sonhaDuong: '', loaidc: 'Nhà riêng', macdinh: false
};

function AddressModal({ show, onClose, onAddressChanged }) {
    const [view, setView] = useState('list'); 
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    
    // State cho API địa chỉ
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);         
    
    // State cho ID đã chọn
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    
    // 2. Tải danh sách địa chỉ (của user) khi mở
    useEffect(() => {
        if (show) {
            fetchAddresses();
            setView('list'); 
        }
    }, [show]);

    // 3. Tải TỈNH/THÀNH PHỐ
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch(`${PROVINCE_API_URL}/p/`);
                if (res.ok) setProvinces(await res.json());
            } catch (e) { console.error("Lỗi tải tỉnh/thành", e); }
        };
        fetchProvinces();
    }, []);

    // 4. Tải QUẬN/HUYỆN khi `selectedProvinceId` thay đổi
    useEffect(() => {
        if (!selectedProvinceId) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const fetchDistricts = async () => {
            try {
                const res = await fetch(`${PROVINCE_API_URL}/p/${selectedProvinceId}?depth=2`);
                if (res.ok) {
                    const data = await res.json();
                    const districtList = data.districts || [];
                    setDistricts(districtList);
                    
                    if (view === 'update' && formData.quanhuyen) {
                        const matchingDistrict = districtList.find(d => d.name === formData.quanhuyen);
                        if (matchingDistrict) {
                            setSelectedDistrictId(matchingDistrict.code); 
                        }
                    }
                }
            } catch (e) { console.error("Lỗi tải quận/huyện", e); }
        };
        fetchDistricts();
        setWards([]); 
    }, [selectedProvinceId, view, formData.quanhuyen]);

    // 5. Tải PHƯỜNG/XÃ khi `selectedDistrictId` thay đổi
    useEffect(() => {
        if (!selectedDistrictId) {
            setWards([]);
            return;
        }
        const fetchWards = async () => {
             try {
                const res = await fetch(`${PROVINCE_API_URL}/d/${selectedDistrictId}?depth=2`);
                if (res.ok) {
                    const data = await res.json();
                    setWards(data.wards || []);
                }
            } catch (e) { console.error("Lỗi tải phường/xã", e); }
        };
        fetchWards();
    }, [selectedDistrictId]);

    // =================================================================
    // SỬA LỖI: DI CHUYỂN 3 HÀM useMemo LÊN ĐẦU (TRƯỚC KHI RETURN)
    // =================================================================
    const provinceOptions = useMemo(() => 
        provinces.map(p => ({ value: p.code, label: p.name })), [provinces]);
    
    const districtOptions = useMemo(() => 
        districts.map(d => ({ value: d.code, label: d.name })), [districts]);

    const wardOptions = useMemo(() => 
        wards.map(w => ({ value: w.name, label: w.name })), [wards]);
    // =================================================================
    // KẾT THÚC SỬA LỖI
    // =================================================================

    // ----- CÁC HÀM XỬ LÝ -----
    
    const fetchAddresses = async () => {
        const token = getAuthToken();
        const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` }});
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
            const defaultAddr = data.find(a => a.macdinh);
            setSelectedAddressId(defaultAddr ? defaultAddr.madc : (data.length > 0 ? data[0].madc : null));
        }
    };

    const handleApply = async () => {
        if (!selectedAddressId) return;
        const token = getAuthToken();
        await fetch(`${API_URL}/setDefault/${selectedAddressId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        onAddressChanged(); 
        onClose();
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        const isUpdate = view === 'update';
        const url = isUpdate ? `${API_URL}/${formData.madc}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            if(formData.macdinh) { onAddressChanged(); }
            fetchAddresses(); 
            setView('list');
        } else {
            alert(isUpdate ? "Lỗi khi cập nhật địa chỉ" : "Lỗi khi thêm địa chỉ");
        }
    };
    
    const openNewForm = () => {
        setFormData(EMPTY_FORM);
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setView('new');
    };

    const openUpdateForm = (addressToUpdate) => {
        setFormData(addressToUpdate);
        
        const matchingProvince = provinces.find(p => p.name === addressToUpdate.tinhthanh);
        if (matchingProvince) {
            setSelectedProvinceId(matchingProvince.code); 
        } else {
            setSelectedProvinceId(null);
            setSelectedDistrictId(null);
        }
        
        setView('update');
    };

    // =================================================================
    // SỬA LỖI: DI CHUYỂN LỆNH RETURN NÀY XUỐNG SAU CÁC HOOK
    // =================================================================
    if (!show) return null;

    // ----- JSX CHO DANH SÁCH -----
    const renderListView = () => (
        <div className="modal__body-address" style={{ display: 'block' }}>
            <div className="auth-form">
                <div className="auth-form__container">
                    <div className="auth-form__header">
                        <h3 className="auth-form__heading">Địa chỉ giao hàng</h3>
                        <i className="fa-solid fa-xmark auth-form__close" onClick={onClose}></i>
                    </div>
                    <div className="address-list__body">
                        {addresses.map(addr => (
                            <div className="address-list__item" key={addr.madc}>
                                <input 
                                    type="radio" name="delivery_address" className="address-list__radio" id={`addr-${addr.madc}`}
                                    checked={selectedAddressId === addr.madc}
                                    onChange={() => setSelectedAddressId(addr.madc)}
                                />
                                <label htmlFor={`addr-${addr.madc}`} className="address-list__info">
                                    <div className="info-header">
                                        <span className="info-name">{addr.hotenNhan}</span>
                                        <span className="info-phone">{addr.sdtNhan}</span>
                                    </div>
                                    <div className="info-address">{`${addr.sonhaDuong}, ${addr.phuongxa}, ${addr.quanhuyen}, ${addr.tinhthanh}`}</div>
                                    <div className="info-tags">
                                        {addr.loaidc && <span className="user-tag tag-type">{addr.loaidc}</span>}
                                        {addr.macdinh && <span className="user-tag tag-default">Mặc định</span>}
                                    </div>
                                </label>
                                <span className="address-list__update-link" onClick={() => openUpdateForm(addr)} style={{ cursor: 'pointer' }}>
                                    Cập nhật
                                </span>
                            </div>
                        ))}
                        <button className="address-list__add-btn" onClick={openNewForm}>
                            <i className="fa-solid fa-plus"></i>
                            Thêm địa chỉ
                        </button>
                    </div>
                    <div className="auth-form__controls">
                        <button className="btn auth-form__controls-back btn--normal" onClick={onClose}>Quay lại</button>
                        <button className="btn btn--primary" onClick={handleApply}>Áp dụng</button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ----- JSX CHO FORM -----
    const renderFormView = () => {
        const isUpdate = view === 'update';
        
        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };

        // TÌM OBJECT ĐÃ CHỌN (cho `react-select`)
        const selectedProvince = provinceOptions.find(p => p.value === selectedProvinceId);
        const selectedDistrict = districtOptions.find(d => d.value === selectedDistrictId);
        const selectedWard = wardOptions.find(w => w.value === formData.phuongxa);

        // CÁC HÀM ONCHANGE MỚI CHO `react-select`
        const handleProvinceChange = (selectedOption) => {
            setSelectedProvinceId(selectedOption.value);
            setFormData(prev => ({ ...prev, tinhthanh: selectedOption.label, quanhuyen: '', phuongxa: '' }));
            setSelectedDistrictId(null);
        };
        
        const handleDistrictChange = (selectedOption) => {
            setSelectedDistrictId(selectedOption.value);
            setFormData(prev => ({ ...prev, quanhuyen: selectedOption.label, phuongxa: '' }));
        };
        
        const handleWardChange = (selectedOption) => {
            setFormData(prev => ({ ...prev, phuongxa: selectedOption.label }));
        };
        
        return (
            <div className="modal__body-address" style={{ display: 'block' }}>
                <form className="auth-form" onSubmit={handleSave}>
                    <div className="auth-form__container">
                         <div className="auth-form__header">
                            <h3 className="auth-form__heading">{isUpdate ? "Cập nhật địa chỉ" : "Địa chỉ mới"}</h3>
                            <i className="fa-solid fa-xmark auth-form__close" onClick={onClose}></i>
                        </div>
                        <div className="auth-form__form">
                            {/* Input Họ tên, SĐT */}
                            <div className="auth-form__group">
                                <p className="auth-form__name">Họ và tên</p>
                                <input type="text" className="auth-form__input" placeholder="Họ và tên" required
                                       name="hotenNhan" value={formData.hotenNhan} onChange={handleChange} />
                            </div>
                            <div className="auth-form__group">
                                <p className="auth-form__name">Số điện thoại</p>
                                <input type="text" className="auth-form__input" placeholder="Số điện thoại" required
                                       name="sdtNhan" value={formData.sdtNhan} onChange={handleChange} />
                            </div>
                            
                            <div className="auth-form__group">
                                <p className="auth-form__name">Tỉnh/Thành phố</p>
                                <Select
                                    options={provinceOptions}
                                    value={selectedProvince}
                                    onChange={handleProvinceChange}
                                    placeholder="Chọn Tỉnh/Thành phố..."
                                    className="auth-form__select" 
                                    required
                                />
                            </div>
                            <div className="auth-form__group">
                                <p className="auth-form__name">Quận/Huyện</p>
                                <Select
                                    options={districtOptions}
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                    placeholder="Chọn Quận/Huyện..."
                                    className="auth-form__select"
                                    isDisabled={!selectedProvinceId}
                                    required
                                />
                            </div>
                            <div className="auth-form__group">
                                <p className="auth-form__name">Phường/Xã</p>
                                <Select
                                    options={wardOptions}
                                    value={selectedWard}
                                    onChange={handleWardChange}
                                    placeholder="Chọn Phường/Xã..."
                                    className="auth-form__select"
                                    isDisabled={!selectedDistrictId}
                                    required
                                />
                            </div>
                            
                             <div className="auth-form__group">
                                <p className="auth-form__name">Số nhà, tên đường</p>
                                <input type="text" className="auth-form__input" placeholder="Số nhà, tên đường" required
                                       name="sonhaDuong" value={formData.sonhaDuong} onChange={handleChange} />
                            </div>
                            {/* Loại địa chỉ, Mặc định */}
                            <div className="auth-form__group">
                                <label className="auth-form__label">Loại địa chỉ</label>
                                <div className="address-form__type-toggle">
                                    <button type="button" className={`address-form__type-btn ${formData.loaidc === 'Nhà riêng' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, loaidc: 'Nhà riêng'})}>Nhà riêng</button>
                                    <button type="button" className={`address-form__type-btn ${formData.loaidc === 'Công ty' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, loaidc: 'Công ty'})}>Công ty</button>
                                </div>
                            </div>
                            <div className="address-form__default-check">
                                <input type="checkbox" id="default-address-check" className="cart__checkbox"
                                       name="macdinh" checked={formData.macdinh} onChange={handleChange} />
                                <label htmlFor="default-address-check">Đặt làm địa chỉ mặc định</label>
                            </div>
                        </div>
                        <div className="auth-form__controls">
                            <button type="button" className="btn auth-form__controls-back btn--normal" onClick={() => setView('list')}>Quay lại</button>
                            <button type="submit" className="btn btn--primary">Lưu lại</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    // ----- JSX CHÍNH -----
    return (
        // SỬA DÒNG NÀY:
        <div className="app-modal open" id="address-modal-container"> 
            {/* SỬA DÒNG NÀY: */}
            <div className="app-modal__overlay" onClick={onClose}></div>
            
            {view === 'list' && renderListView()}
            {(view === 'new' || view === 'update') && renderFormView()}
        </div>
    );
}

export default AddressModal;