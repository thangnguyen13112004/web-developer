namespace Pharmacity.DTOs
{
    // DTO cho danh sách (giữ nguyên hoặc dùng chung)
    public class ClientOrderDto
    {
        public int MaDH { get; set; }
        public DateTime NgayDat { get; set; }
        public double TongTien { get; set; }
        public string TrangThai { get; set; }
        public List<ClientOrderItemDto> ChiTiet { get; set; }
    }

    // DTO chi tiết cho trang Order Detail (MỚI)
    public class ClientOrderDetailDto
    {
        public int MaDH { get; set; }
        public DateTime NgayDat { get; set; }
        public string TrangThai { get; set; }

        // Thông tin người nhận (Lấy từ bảng SoDiaChi)
        public string NguoiNhan { get; set; }
        public string SDT { get; set; }
        public string DiaChiGiaoHang { get; set; }

        // Chi tiết sản phẩm
        public List<ClientOrderItemDto> ChiTiet { get; set; }

        // Thanh toán
        public double TienHang { get; set; }
        public double PhiVanChuyen { get; set; } // Mặc định 0 hoặc tính toán
        public double TongTien { get; set; }
        public string PhuongThucThanhToan { get; set; } // COD, Momo...
    }

    public class ClientOrderItemDto
    {
        public string TenThuoc { get; set; }
        public string HinhAnh { get; set; }
        public string DonViTinh { get; set; }
        public int SoLuong { get; set; }
        public double DonGia { get; set; }
        public double ThanhTien { get; set; }
    }
}

