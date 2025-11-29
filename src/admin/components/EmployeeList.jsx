import React, { useEffect, useState } from 'react';
import { Plus, Lock, Unlock, UserPlus, Trash2 } from 'lucide-react';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ hoTen: '', chucVu: 'Nhân viên', taiKhoan: '', matKhau: '' });

    const fetchEmployees = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/employees', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setEmployees(await res.json());
            else if (res.status === 403) alert("Bạn không có quyền truy cập trang này");
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/employees', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Thêm nhân viên thành công");
                setShowModal(false);
                setFormData({ hoTen: '', chucVu: 'Nhân viên', taiKhoan: '', matKhau: '' });
                fetchEmployees();
            } else {
                const err = await res.json();
                alert("Lỗi: " + err.message);
            }
        } catch (e) { console.error(e); }
    };

    const handleToggleStatus = async (id) => {
        if (!window.confirm("Bạn có chắc muốn đổi trạng thái nhân viên này?")) return;
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/employees/${id}/toggle-status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchEmployees();
            else alert("Lỗi cập nhật");
        } catch (e) { console.error(e); }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn nhân viên này? Nếu họ đã có lịch sử làm việc, hệ thống sẽ chặn xóa.")) return;
        
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/employees/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa nhân viên.");
                fetchEmployees();
            } else {
                const err = await res.json();
                alert("Lỗi: " + err.message);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân sự</h1>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                    <UserPlus size={18} /> Thêm nhân viên
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mã NV</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Họ tên</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tài khoản</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Chức vụ</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {employees.map((nv) => (
                            <tr key={nv.maNV} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">#{nv.maNV}</td>
                                <td className="px-6 py-4 font-medium">{nv.hoTen}</td>
                                <td className="px-6 py-4 text-gray-500">{nv.taiKhoan}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        nv.chucVu === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                        nv.chucVu === 'Quản lý cửa hàng' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {nv.chucVu}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs ${nv.trangThai ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {nv.trangThai ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                    
                                    {/* NÚT XÓA */}
                                    <button onClick={() => handleDeleteEmployee(nv.maNV)} className="text-red-400 hover:text-red-600" title="Xóa vĩnh viễn">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleToggleStatus(nv.maNV)} className="text-gray-500 hover:text-blue-600" title={nv.trangThai ? 'Khóa' : 'Mở khóa'}>
                                        {nv.trangThai ? <Lock size={18} /> : <Unlock size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM NHÂN VIÊN */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded shadow-lg w-96" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Thêm nhân viên mới</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Họ và tên" required 
                                value={formData.hoTen} onChange={e => setFormData({...formData, hoTen: e.target.value})} />
                            <input className="w-full border p-2 rounded" placeholder="Tài khoản đăng nhập" required 
                                value={formData.taiKhoan} onChange={e => setFormData({...formData, taiKhoan: e.target.value})} />
                            <input className="w-full border p-2 rounded" type="password" placeholder="Mật khẩu" required 
                                value={formData.matKhau} onChange={e => setFormData({...formData, matKhau: e.target.value})} />
                            <select className="w-full border p-2 rounded" value={formData.chucVu} onChange={e => setFormData({...formData, chucVu: e.target.value})}>
                                <option value="Nhân viên">Nhân viên</option>
                                <option value="Quản lý cửa hàng">Quản lý cửa hàng</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;