namespace Pharmacity.DTOs.Admin
{
    public class DiscountRequestDto
    {
        public string TenDotKM { get; set; }
        public string LoaiApDung { get; set; } // "Category" hoặc "CustomGroup"
        public int? TargetId { get; set; } // ID Danh mục (nếu chọn theo danh mục)
        public List<int> ProductIds { get; set; } // List ID thuốc (nếu chọn nhóm)
        public double PhanTramGiam { get; set; } // Ví dụ: 20
        public DateTime? NgayKetThuc { get; set; }
    }
}
