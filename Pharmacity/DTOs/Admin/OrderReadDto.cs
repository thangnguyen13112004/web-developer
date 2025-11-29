namespace Pharmacity.DTOs.Admin
{
    public class OrderReadDto
    {
        public int MaDH { get; set; }
        public string TenKhachHang { get; set; }
        public string SDT { get; set; }
        public DateTime NgayDat { get; set; }
        public double TongTien { get; set; }

        // Trạng thái đơn hàng (Quy trình vận đơn)
        public string TrangThaiDH { get; set; }

        // Trạng thái thanh toán (Tiền nong)
        public string TrangThaiTT { get; set; }
        public string PhuongThucTT { get; set; }

        public string NhanVienXuLy { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string TrangThaiMoi { get; set; }
    }
}
