import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Printer, RefreshCw, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- SỬA CÁCH IMPORT QUAN TRỌNG

const WarehouseImport = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    
    // Dữ liệu đang nhập
    const [importData, setImportData] = useState({
        maNCC: '',
        ghiChu: '',
        chiTiet: [] 
    });

    // Dữ liệu phiếu VỪA NHẬP THÀNH CÔNG
    const [successReceipt, setSuccessReceipt] = useState(null);

    const [currentRow, setCurrentRow] = useState({
        maThuoc: '', soLo: '', ngaySanXuat: '', hanSuDung: '', soLuong: 1, donGiaNhap: 0
    });

    const loadInitialData = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const supRes = await fetch('http://localhost:5223/api/admin/warehouse/suppliers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(supRes.ok) setSuppliers(await supRes.json());

            // Lấy danh sách thuốc (bao gồm cả Đơn vị tính để in PDF)
            const prodRes = await fetch('http://localhost:5223/api/admin/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(prodRes.ok) setProducts(await prodRes.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { loadInitialData(); }, []);

    // --- HÀM TIỆN ÍCH: Xóa dấu tiếng Việt (để in PDF không lỗi font) ---
    const removeVietnameseTones = (str) => {
        if (!str) return "";
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str = str.replace(/đ/g,"d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    }

    // --- HÀM TIỆN ÍCH: Đọc số thành chữ (Sơ lược) ---
    const readMoney = (money) => {
        // Đây là hàm giả lập đơn giản, bạn có thể dùng thư viện 'n-vi-n2w' để chuẩn hơn
        if(money === 0) return "Khong dong";
        return money.toLocaleString('vi-VN') + " dong"; 
    }

    // --- HÀM XUẤT PDF CHUẨN MẪU ---
    const handleExportPDF = () => {
        const dataToExport = successReceipt || importData;

        if (!dataToExport || dataToExport.chiTiet.length === 0) {
            alert("Không có dữ liệu phiếu nhập để xuất!");
            return;
        }

        const doc = new jsPDF();
        const selectedSupplier = suppliers.find(s => s.maNCC == dataToExport.maNCC) || {};
        const today = new Date();
        
        // Lấy tên nhân viên từ localStorage
        const userStr = localStorage.getItem('appUser');
        const currentUser = userStr ? JSON.parse(userStr) : { hoTen: 'Admin' };
        const staffName = removeVietnameseTones(currentUser.hoTen || currentUser.name || 'Admin');

        // --- 1. HEADER ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CONG TY CO PHAN PHARMACITY", 105, 15, null, null, "center");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Chi nhanh: Quan ly Kho Tong", 105, 22, null, null, "center");

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("PHIEU NHAP KHO", 105, 35, null, null, "center");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`So: PN${dataToExport.mapn || '...'}/NK`, 105, 42, null, null, "center");
        doc.text(`Ngay ${today.getDate()} thang ${today.getMonth() + 1} nam ${today.getFullYear()}`, 105, 47, null, null, "center");

        // --- 2. THÔNG TIN CHUNG (Căn trái) ---
        doc.setFont("helvetica", "normal");
        let yPos = 60;
        const lineGap = 7;

        // Nhà cung cấp
        doc.text(`Nha cung cap: ${removeVietnameseTones(selectedSupplier.tenNCC || '................................................')}`, 15, yPos);
        
        // Địa chỉ (Placeholder vì API hiện tại chưa trả về địa chỉ NCC)
        doc.text(`Dia chi: ....................................................................................................................`, 15, yPos + lineGap);
        
        // SĐT (Placeholder)
        doc.text(`So dien thoai: ......................................`, 15, yPos + lineGap*2);
        
        // Người giao hàng
        doc.text(`Nguoi giao hang: ..........................................................................................................`, 15, yPos + lineGap*3);
        
        // Lý do nhập
        doc.text(`Ly do nhap: [X] Nhap tu NCC   [ ] Tra hang   [ ] Dieu chuyen`, 15, yPos + lineGap*4);
        
        // Ghi chú / Số hóa đơn
        doc.text(`So hoa don / Ghi chu: ${removeVietnameseTones(dataToExport.ghiChu || '......................................')}`, 15, yPos + lineGap*5);

        // --- 3. BẢNG CHI TIẾT ---
        const tableColumn = ["STT", "Ten san pham", "Ma SP", "DVT", "So luong", "Don gia", "Thanh tien"];
        const tableRows = [];

        dataToExport.chiTiet.forEach((item, index) => {
            // Tìm sản phẩm gốc để lấy Đơn Vị Tính (DVT)
            const productInfo = products.find(p => p.mathuoc === item.maThuoc);
            const dvt = productInfo ? removeVietnameseTones(productInfo.donvitinh) : "Hop";

            const row = [
                index + 1,
                removeVietnameseTones(item.tenThuoc),
                `TH${item.maThuoc}`, // Mã SP giả lập TH + ID
                dvt, 
                item.soLuong,
                item.donGiaNhap.toLocaleString('en-US'),
                item.thanhTien.toLocaleString('en-US')
            ];
            tableRows.push(row);
        });

        // SỬA LẠI CÁCH GỌI AUTOTABLE
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 45,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                font: "helvetica",
                textColor: [0, 0, 0], // Màu chữ đen
                lineColor: [0, 0, 0], // Viền đen
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [220, 220, 220], // Màu nền xám nhạt cho header
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 }, // STT
                2: { halign: 'center' }, // Mã SP
                3: { halign: 'center' }, // DVT
                4: { halign: 'right' },  // SL
                5: { halign: 'right' },  // Đơn giá
                6: { halign: 'right' }   // Thành tiền
            }
        });

        // --- 4. FOOTER TỔNG TIỀN ---
        const finalY = doc.lastAutoTable.finalY + 10;
        const total = dataToExport.chiTiet.reduce((sum, item) => sum + item.thanhTien, 0);
        
        doc.setFont("helvetica", "bold");
        doc.text(`Tong cong:   ${total.toLocaleString('en-US')} VND`, 190, finalY, null, null, "right");
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`(Viet bang chu): ${removeVietnameseTones(readMoney(total))} ...........................................`, 190, finalY + 6, null, null, "right");

        // --- 5. CHỮ KÝ ---
        const sigY = finalY + 25;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        
        doc.text("Nhan vien", 40, sigY, null, null, "center");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("(Ky, ghi ro ho ten)", 40, sigY + 5, null, null, "center");
        // Tên nhân viên đăng nhập
        doc.setFont("helvetica", "bold");
        doc.text(staffName, 40, sigY + 30, null, null, "center");


        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Nguoi giao hang", 105, sigY, null, null, "center");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("(Ky, ghi ro ho ten)", 105, sigY + 5, null, null, "center");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Nguoi lap phieu", 170, sigY, null, null, "center");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("(Ky, ghi ro ho ten)", 170, sigY + 5, null, null, "center");

        doc.save(`Phieu_Nhap_${today.getTime()}.pdf`);
    };

    // --- LOGIC FORM ---
    const handleAddRow = () => {
        if (!currentRow.maThuoc || !currentRow.soLo) {
            alert("Vui lòng chọn thuốc và nhập số lô!");
            return;
        }
        const selectedProd = products.find(p => p.mathuoc == currentRow.maThuoc);
        const newRow = {
            ...currentRow,
            tenThuoc: selectedProd?.tenthuoc || "Unknown",
            thanhTien: currentRow.soLuong * currentRow.donGiaNhap
        };
        setImportData({
            ...importData,
            chiTiet: [...importData.chiTiet, newRow]
        });
        setCurrentRow({ ...currentRow, maThuoc: '', soLo: '' }); 
    };

    const handleRemoveRow = (index) => {
        const newDetails = importData.chiTiet.filter((_, i) => i !== index);
        setImportData({...importData, chiTiet: newDetails});
    };

    const handleSubmit = async () => {
        if (!importData.maNCC || importData.chiTiet.length === 0) {
            alert("Vui lòng chọn NCC và nhập ít nhất 1 dòng hàng");
            return;
        }

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('http://localhost:5223/api/admin/warehouse/import', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(importData)
            });

            const data = await res.json();

            if (res.ok) {
                alert("Nhập hàng thành công!");
                // Lưu mapn trả về từ backend để in số phiếu
                setSuccessReceipt({ ...importData, mapn: data.mapn }); 
                setImportData({ maNCC: '', ghiChu: '', chiTiet: [] });
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối server");
        }
    };

    const totalAmount = importData.chiTiet.reduce((sum, item) => sum + item.thanhTien, 0);

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen space-y-8">
            
            {/* --- PHẦN 1: FORM NHẬP LIỆU --- */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-800">Tạo Phiếu Nhập Hàng</h1>
                    <button onClick={loadInitialData} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        <RefreshCw size={14}/> Cập nhật danh sách thuốc
                    </button>
                </div>

                <div className="bg-white p-6 rounded shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold mb-2 text-gray-700">Nhà cung cấp *</label>
                        <select 
                            className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            value={importData.maNCC}
                            onChange={(e) => setImportData({...importData, maNCC: e.target.value})}
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map(s => (
                                <option key={s.maNCC || s.MaNCC} value={s.maNCC || s.MaNCC}>{s.tenNCC || s.TenNCC}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold mb-2 text-gray-700">Ghi chú</label>
                        <input type="text" className="w-full border p-2 rounded" value={importData.ghiChu} onChange={(e) => setImportData({...importData, ghiChu: e.target.value})} placeholder="VD: Nhập theo HĐ số 123..."/>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow-sm border border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sản phẩm</label>
                            <select className="w-full border p-2 rounded" value={currentRow.maThuoc} onChange={(e) => setCurrentRow({...currentRow, maThuoc: e.target.value})}>
                                <option value="">-- Chọn thuốc --</option>
                                {products.map(p => <option key={p.mathuoc} value={p.mathuoc}>{p.tenthuoc}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Số lô</label><input type="text" className="w-full border p-2 rounded uppercase" value={currentRow.soLo} onChange={(e) => setCurrentRow({...currentRow, soLo: e.target.value})}/></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">NSX</label><input type="date" className="w-full border p-2 rounded" value={currentRow.ngaySanXuat} onChange={(e) => setCurrentRow({...currentRow, ngaySanXuat: e.target.value})}/></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">HSD</label><input type="date" className="w-full border p-2 rounded" value={currentRow.hanSuDung} onChange={(e) => setCurrentRow({...currentRow, hanSuDung: e.target.value})}/></div>
                        <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-500 mb-1">SL</label><input type="number" className="w-full border p-2 rounded" value={currentRow.soLuong} min="1" onChange={(e) => setCurrentRow({...currentRow, soLuong: parseInt(e.target.value)})}/></div>
                        <div className="md:col-span-1"><label className="block text-xs font-bold text-gray-500 mb-1">Giá</label><input type="number" className="w-full border p-2 rounded" value={currentRow.donGiaNhap} min="0" onChange={(e) => setCurrentRow({...currentRow, donGiaNhap: parseFloat(e.target.value)})}/></div>
                        <div className="md:col-span-1"><button onClick={handleAddRow} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"><Plus size={20}/></button></div>
                    </div>
                </div>

                {/* Bảng nhập liệu hiện tại */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Tên thuốc</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Lô / NSX - HSD</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">SL</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">Thành tiền</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500">Xóa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {importData.chiTiet.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{item.tenThuoc}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="font-bold">{item.soLo}</span><br/>
                                        <span className="text-xs text-gray-500">{item.ngaySanXuat} - {item.hanSuDung}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">{item.soLuong}</td>
                                    <td className="px-4 py-3 text-right font-bold">{item.thanhTien.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center"><button onClick={() => handleRemoveRow(idx)} className="text-red-500"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end items-center gap-6 bg-white p-4 rounded shadow border-t">
                    <div className="text-right">
                        <span className="text-gray-500 text-sm block">Tổng tiền</span>
                        <span className="text-2xl font-bold text-blue-700">{totalAmount.toLocaleString()} VNĐ</span>
                    </div>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700 flex items-center gap-2">
                        <Save size={20}/> LƯU PHIẾU NHẬP
                    </button>
                </div>
            </div>

            {/* --- PHẦN 2: KẾT QUẢ NHẬP KHO --- */}
            {successReceipt && (
                <div className="mt-12 border-t-4 border-green-500 pt-8 animate-fadeIn pb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
                            <CheckCircle size={24}/> Phiếu nhập kho vừa hoàn tất
                        </h2>
                        <button 
                            onClick={handleExportPDF} 
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-50 flex items-center gap-2 font-bold"
                        >
                            <Printer size={18}/> Xuất PDF & In
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded shadow-lg">
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm border-b pb-4">
                            <div><strong>Nhà cung cấp:</strong> {suppliers.find(s => s.maNCC == successReceipt.maNCC)?.tenNCC}</div>
                            <div><strong>Ghi chú:</strong> {successReceipt.ghiChu}</div>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">STT</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">Sản phẩm</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-green-800 uppercase">Số lô</th>
                                    <th className="px-4 py-2 text-center text-xs font-bold text-green-800 uppercase">NSX - HSD</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-green-800 uppercase">SL</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-green-800 uppercase">Đơn giá</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-green-800 uppercase">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {successReceipt.chiTiet.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 text-center">{idx + 1}</td>
                                        <td className="px-4 py-2 font-medium">{item.tenThuoc}</td>
                                        <td className="px-4 py-2 font-bold text-gray-600">{item.soLo}</td>
                                        <td className="px-4 py-2 text-center text-xs">{item.ngaySanXuat} - {item.hanSuDung}</td>
                                        <td className="px-4 py-2 text-right">{item.soLuong}</td>
                                        <td className="px-4 py-2 text-right">{item.donGiaNhap.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right font-bold">{item.thanhTien.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseImport;