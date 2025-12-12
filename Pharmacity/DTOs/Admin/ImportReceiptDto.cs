namespace Pharmacity.DTOs.Admin
{
    // Header phiếu nhập
    public class ImportReceiptDto
    {
        public int MaNCC { get; set; }
        public string GhiChu { get; set; }
        // MaNV sẽ lấy từ Token của người đăng nhập
        public List<ImportItemDto> ChiTiet { get; set; }
    }

    // Chi tiết từng dòng sản phẩm
    public class ImportItemDto
    {
        public int MaThuoc { get; set; }
        public string SoLo { get; set; }
        public DateTime NgaySanXuat { get; set; }
        public DateTime HanSuDung { get; set; }
        public int SoLuong { get; set; }
        public double DonGiaNhap { get; set; }
    }

    // DTO trả về danh sách nhà cung cấp cho Dropdown
    public class SupplierDto
    {
        public int MaNCC { get; set; }
        public string TenNCC { get; set; }

        // --- THÊM 2 TRƯỜNG NÀY ---
        public string DiaChi { get; set; }
        public string SDT { get; set; }
    }
}
