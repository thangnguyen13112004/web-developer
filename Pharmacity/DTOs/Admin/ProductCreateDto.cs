using System.ComponentModel.DataAnnotations;

namespace Pharmacity.DTOs.Admin
{
    public class ProductCreateDto
    {
        [Required(ErrorMessage = "Tên thuốc không được để trống")]
        public string TenThuoc { get; set; }

        public string? HoatChat { get; set; }
        public string? SoDangKy { get; set; }
        public string? QuyCachDongGoi { get; set; }
        public string? DonViTinh { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá bán phải lớn hơn 0")]
        public double GiaBan { get; set; }

        public double? GiaCu { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn không hợp lệ")]
        public int SoLuongTon { get; set; }

        public string? NhaSX { get; set; }
        public string? ChongChiDinh { get; set; }
        public string? LieuDung { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn danh mục")]
        public int MaLoai { get; set; }

        public string? HinhAnhBase64 { get; set; } // Nhận chuỗi Base64
    }
}
