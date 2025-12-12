namespace Pharmacity.DTOs.Admin
{
    // DTO chứa thông tin tổng quan của đơn hàng chi tiết
    public class OrderDetailDto
    {
        public int MaDH { get; set; }
        public string TenKhachHang { get; set; }
        public string SDT { get; set; }
        public DateTime NgayDat { get; set; }
        public string TrangThaiDH { get; set; }

        // Thông tin giao hàng
        public string NguoiNhan { get; set; }
        public string SDTNhan { get; set; }
        public string DiaChiGiao { get; set; }

        // Thông tin thanh toán
        public string PhuongThucTT { get; set; }
        public string TrangThaiTT { get; set; }
        public double TongTien { get; set; }

        // Danh sách sản phẩm trong đơn
        public List<OrderItemDto> Items { get; set; }
    }

    // DTO chứa thông tin từng sản phẩm trong đơn
    public class OrderItemDto
    {
        public int MaThuoc { get; set; }
        public string TenThuoc { get; set; }
        public string HinhAnh { get; set; }
        public string DonViTinh { get; set; }
        public int SoLuong { get; set; }
        public double DonGia { get; set; }
        public double ThanhTien { get; set; }

        // Thông tin lô (Quan trọng để nhân viên kho lấy hàng)
        public string SoLo { get; set; }
        public DateTime? HanSuDung { get; set; }
    }
}
