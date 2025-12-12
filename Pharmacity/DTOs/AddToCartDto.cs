namespace Pharmacity.DTOs
{
    public class AddToCartDto
    {
        public int MaThuoc { get; set; }
        public int SoLuong { get; set; }
        public int? MaLo { get; set; } // Thêm trường này, cho phép null
    }
}
