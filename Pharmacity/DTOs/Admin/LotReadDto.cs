namespace Pharmacity.DTOs.Admin
{
    public class LotReadDto
    {
        public int MaLo { get; set; }
        public string TenThuoc { get; set; }
        public string SoLo { get; set; }
        public DateTime? NSX { get; set; }
        public DateTime? HSD { get; set; }
        public int SoLuongNhap { get; set; }
        public int TonKhoHienTai { get; set; } // Thêm tồn kho thực tế của lô này
        public double DonGiaNhap { get; set; }
        public string TenNCC { get; set; }
        public DateTime? NgayNhap { get; set; }
    }
}
