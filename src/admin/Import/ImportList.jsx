import React, { useEffect, useState } from 'react';
import { Eye, Printer, Search, FileText,Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ImportList = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState(null); // Để hiện Modal chi tiết
    const [searchTerm, setSearchTerm] = useState('');

    // --- 1. LOAD DANH SÁCH ---
    useEffect(() => {
        const fetchReceipts = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch('http://localhost:5223/api/admin/warehouse/receipts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setReceipts(await res.json());
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchReceipts();
    }, []);

    // --- 2. LOAD CHI TIẾT ---
    const handleViewDetail = async (id) => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/warehouse/receipts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSelectedReceipt(await res.json());
        } catch (err) { console.error(err); }
    };

    // --- 3. LOGIC IN PDF (Tái sử dụng) ---
    const removeVietnameseTones = (str) => {
        if (!str) return "";
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const handlePrintPDF = (data) => {
        const doc = new jsPDF();
        const today = new Date(data.ngaynhap); // Dùng ngày nhập của phiếu

        // Header
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text("CONG TY CO PHAN PHARMACITY", 105, 15, null, null, "center");
        doc.setFontSize(18);
        doc.text("PHIEU NHAP KHO (SAO Y)", 105, 30, null, null, "center"); // Thêm chữ Sao Y
        
        doc.setFontSize(10); doc.setFont("helvetica", "italic");
        doc.text(`So: PN${data.mapn}/NK`, 105, 38, null, null, "center");
        doc.text(`Ngay ${today.getDate()} thang ${today.getMonth() + 1} nam ${today.getFullYear()}`, 105, 43, null, null, "center");

        // Info
        doc.setFont("helvetica", "normal");
        let yPos = 55;
        doc.text(`Nha cung cap: ${removeVietnameseTones(data.tenNCC)}`, 15, yPos);
        doc.text(`Nguoi nhap: ${removeVietnameseTones(data.nguoiNhap)}`, 15, yPos + 7);
        doc.text(`Ghi chu: ${removeVietnameseTones(data.ghichu || '')}`, 15, yPos + 14);

        // Table
        const tableColumn = ["STT", "Ten thuoc", "DVT", "So Lo", "HSD", "SL", "Don gia", "Thanh tien"];
        const tableRows = data.chiTiet.map((item, index) => [
            index + 1,
            removeVietnameseTones(item.tenThuoc),
            removeVietnameseTones(item.dvt),
            item.soLo,
            new Date(item.hanSuDung).toLocaleDateString('en-GB'),
            item.soLuong,
            item.donGiaNhap.toLocaleString('en-US'),
            item.thanhTien.toLocaleString('en-US')
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 25,
            theme: 'grid',
            styles: { fontSize: 9, font: "helvetica" },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.text(`Tong cong: ${data.tongTien.toLocaleString('en-US')} VND`, 190, finalY, null, null, "right");

        doc.save(`Phieu_Nhap_${data.mapn}.pdf`);
    };

    // Filter
    const filteredList = receipts.filter(r => 
        r.tenNCC.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.mapn.toString().includes(searchTerm)
    );

    const handleDeleteReceipt = async (id) => {
        if (!window.confirm(`Xóa phiếu nhập PN${id} sẽ trừ lại tồn kho các thuốc trong phiếu. Nếu thuốc đã bán, bạn không thể xóa. Tiếp tục?`)) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`http://localhost:5223/api/admin/warehouse/receipts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Đã xóa phiếu nhập.");
                // Reload lại danh sách (bạn cần tách hàm fetch ra ngoài useEffect để gọi lại được)
                window.location.reload(); 
            } else {
                const err = await res.json();
                alert("Không thể xóa: " + err.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch Sử Nhập Kho</h1>

            {/* Thanh tìm kiếm */}
            <div className="bg-white p-4 rounded shadow mb-4 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        className="w-full pl-10 pr-4 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Tìm theo Mã phiếu, Tên NCC..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mã PN</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nhà cung cấp</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Người nhập</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày nhập</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? <tr><td colSpan="6" className="text-center py-4">Đang tải...</td></tr> : 
                        filteredList.map((item) => (
                            <tr key={item.mapn} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-blue-600">PN{item.mapn}</td>
                                <td className="px-6 py-4">{item.tenNCC}</td>
                                <td className="px-6 py-4">{item.nguoiNhap}</td>
                                <td className="px-6 py-4">{new Date(item.ngaynhap).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 text-right font-bold">{item.tongtien.toLocaleString()} đ</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleViewDetail(item.mapn)}
                                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                    {/* NÚT XÓA */}
                                    <button 
                                        onClick={() => handleDeleteReceipt(item.mapn)}
                                        className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-full"
                                        title="Xóa phiếu nhập"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setSelectedReceipt(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Chi tiết Phiếu Nhập #PN{selectedReceipt.mapn}</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handlePrintPDF(selectedReceipt)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-2 hover:bg-green-700 text-sm font-bold"
                                >
                                    <Printer size={16}/> In Phiếu
                                </button>
                                <button onClick={() => setSelectedReceipt(null)} className="text-gray-500 hover:text-red-500 font-bold px-2 text-xl">&times;</button>
                            </div>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                                <div>
                                    <p className="text-gray-500">Nhà cung cấp:</p>
                                    <p className="font-bold text-lg">{selectedReceipt.tenNCC}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Ngày nhập:</p>
                                    <p className="font-bold">{new Date(selectedReceipt.ngaynhap).toLocaleString('vi-VN')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Người nhập:</p>
                                    <p className="font-medium">{selectedReceipt.nguoiNhap}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Tổng giá trị:</p>
                                    <p className="font-bold text-xl text-blue-600">{selectedReceipt.tongTien.toLocaleString()} đ</p>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-3 rounded border">
                                    <span className="font-bold">Ghi chú:</span> {selectedReceipt.ghichu || 'Không có'}
                                </div>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200 border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Lô / Hạn dùng</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">SL</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Đơn giá</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {selectedReceipt.chiTiet.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <p className="font-bold">{item.tenThuoc}</p>
                                                <p className="text-xs text-gray-500">{item.dvt}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono bg-yellow-100 px-1 rounded text-yellow-800 font-bold">{item.soLo}</span>
                                                <br/>
                                                <span className="text-xs text-gray-500">{new Date(item.hanSuDung).toLocaleDateString('vi-VN')}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">{item.soLuong}</td>
                                            <td className="px-4 py-3 text-right">{item.donGiaNhap.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-bold">{item.thanhTien.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportList;