namespace Pharmacity.DTOs.Admin
{
    public class ProductCreateDto
    {
        public string TenThuoc { get; set; }
        public string? HoatChat { get; set; }
        public string? SoDangKy { get; set; }
        public string? QuyCachDongGoi { get; set; }
        public string? DonViTinh { get; set; }
        public double GiaBan { get; set; }
        public int SoLuongTon { get; set; }
        public string? NhaSX { get; set; }
        public int MaLoai { get; set; } // Liên kết bảng LoaiThuoc
        public string? HinhAnhBase64 { get; set; } // Nhận chuỗi Base64 từ React
        public string? MoTa { get; set; } // Tương ứng cột LieuDung hoặc ChongChiDinh
    }
}
