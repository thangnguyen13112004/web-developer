namespace Pharmacity.DTOs.Admin
{
    public class ProductReadDto
    {
        public int Mathuoc { get; set; }
        public string Tenthuoc { get; set; }
        public string? Hoatchat { get; set; }
        public string? Sodangky { get; set; }
        public string? Quycachdonggoi { get; set; }
        public string? Donvitinh { get; set; }
        public double Giaban { get; set; }
        public double? Giacu { get; set; }
        public int Soluongton { get; set; }
        public string? Nhasx { get; set; }
        public string? LoaithuocText { get; set; } // Cột Loaithuoc (string) trong DB
        public string? Chongchidinh { get; set; }
        public string? Lieudung { get; set; }
        public string? Hinhanh { get; set; }

        // Thông tin danh mục liên kết
        public int? Maloai { get; set; }
        public string Tenloai { get; set; } // Tên loại lấy từ bảng LoaiThuoc
    }
}
