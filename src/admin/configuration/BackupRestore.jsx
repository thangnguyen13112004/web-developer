import React, { useState } from 'react';
import { Database, Upload, AlertTriangle, CheckCircle, Save, FileText, Calendar } from 'lucide-react';

const BackupRestore = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // State cho lọc ngày
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Hàm gọi API Backup chung
    const callBackupApi = async (endpoint) => {
        setLoading(true); setMessage(null); setError(null);
        try {
            const token = localStorage.getItem('authToken');
            // Xây dựng URL có query params nếu có ngày
            let url = `http://localhost:5223/api/admin/database/${endpoint}`;
            if (endpoint.includes('orders') || endpoint.includes('import-receipts')) {
                const params = new URLSearchParams();
                if (fromDate) params.append('fromDate', fromDate);
                if (toDate) params.append('toDate', toDate);
                if (params.toString()) url += `?${params.toString()}`;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) setMessage(data.message);
            else setError(data.message);
        } catch (err) { 
            console.error(err);
            setError("Lỗi kết nối server"); }
        finally { setLoading(false); }
    };

    // Xử lý Restore (Giữ nguyên)
    const handleRestore = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("Vui lòng chọn file .bak");
        if (!window.confirm("CẢNH BÁO: Phục hồi sẽ XÓA SẠCH dữ liệu hiện tại!")) return;

        setLoading(true); setMessage(null); setError(null);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5223/api/admin/database/restore', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                alert("Thành công! Vui lòng đăng nhập lại.");
                window.location.href = '/';
            } else setError(data.message);
        } catch (err) { 
            console.error(err);
            setError("Lỗi kết nối hoặc timeout"); }
        finally { setLoading(false); }
    };

    const handleRestoreJson = async (endpoint) => {
        // Tạo input file ảo để chọn file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if(!window.confirm(`Bạn muốn phục hồi dữ liệu từ file ${file.name}? Dữ liệu trùng khớp sẽ được cập nhật, dữ liệu mới sẽ được thêm vào.`)) return;

            setLoading(true); setMessage(null); setError(null);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`http://localhost:5223/api/admin/database/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await res.json();
                
                if (res.ok) setMessage(data.message);
                else setError(data.message);
            } catch (err) { 
                console.err(err);
                setError("Lỗi kết nối"); }
            finally { setLoading(false); }
        };
        
        input.click();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Database className="text-blue-600"/> Sao lưu & Phục hồi Hệ thống
            </h1>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex gap-2"><CheckCircle size={18}/> {message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex gap-2"><AlertTriangle size={18}/> {error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. SAO LƯU FULL DATABASE (.BAK) */}
                <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
                    <div className="flex items-center gap-3 mb-4 text-blue-800">
                        <Save size={24} />
                        <h2 className="text-xl font-bold">Sao lưu Toàn bộ (SQL)</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">Tạo file .bak chứa toàn bộ dữ liệu. Dùng để phục hồi khi server gặp sự cố nghiêm trọng.</p>
                    <button onClick={() => callBackupApi('backup')} disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 transition">
                        {loading ? 'Đang xử lý...' : 'Tạo bản Backup Full (.bak)'}
                    </button>
                </div>

                {/* 2. SAO LƯU CHI TIẾT (JSON) */}
                <div className="bg-white p-6 rounded-lg shadow border border-indigo-200">
                    <div className="flex items-center gap-3 mb-4 text-indigo-800">
                        <FileText size={24} />
                        <h2 className="text-xl font-bold">Xuất Dữ liệu (JSON)</h2>
                    </div>
                    
                    {/* Bộ lọc ngày */}
                    <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500">Từ ngày</label>
                            <input type="date" className="w-full border rounded p-1" value={fromDate} onChange={e => setFromDate(e.target.value)}/>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500">Đến ngày</label>
                            <input type="date" className="w-full border rounded p-1" value={toDate} onChange={e => setToDate(e.target.value)}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => callBackupApi('backup/orders')} disabled={loading}
                            className="p-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 font-medium">
                            Sao lưu Đơn hàng
                        </button>
                        <button onClick={() => callBackupApi('backup/import-receipts')} disabled={loading}
                            className="p-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 font-medium">
                            Sao lưu Phiếu nhập
                        </button>
                        <button onClick={() => callBackupApi('backup/products')} disabled={loading}
                            className="p-2 border border-green-600 text-green-600 rounded hover:bg-green-50 font-medium">
                            Sao lưu Kho thuốc
                        </button>
                        <div className="flex gap-2 items-center">
                            {/* Nút Backup */}
                            <button onClick={() => callBackupApi('backup/employees')} disabled={loading}
                                className="flex-1 p-2 border border-orange-600 text-orange-600 rounded hover:bg-orange-50 font-medium">
                                Sao lưu Nhân sự (.json)
                            </button>
                            
                            {/* Nút Restore JSON mới */}
                            <button onClick={() => handleRestoreJson('restore/employees')} disabled={loading}
                                className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
                                title="Nhập dữ liệu từ file JSON">
                                <Upload size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. PHỤC HỒI */}
                <div className="bg-white p-6 rounded-lg shadow border border-red-200 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4 text-red-800">
                        <Upload size={24} />
                        <h2 className="text-xl font-bold">Phục hồi Dữ liệu (Restore)</h2>
                    </div>
                    <div className="bg-red-50 p-3 rounded mb-4 text-red-600 text-sm">
                        <strong>CẢNH BÁO:</strong> Chỉ chấp nhận file <code>.bak</code>. Quá trình này sẽ ngắt kết nối hệ thống và xóa dữ liệu hiện tại.
                    </div>
                    <form onSubmit={handleRestore} className="flex gap-4 items-center">
                        <input type="file" accept=".bak" onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                        <button type="submit" disabled={loading || !selectedFile}
                            className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:bg-gray-400">
                            {loading ? 'Đang chạy...' : 'Restore'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;