namespace Pharmacity.DTOs
{
    public class ClientProfileDto
    {
        public string HoTen { get; set; }
        public string Sdt { get; set; }
        public string Email { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; } // Nam, Nữ, Khác
        public string AnhDaiDien { get; set; } // Base64 string

        // Mật khẩu cũ/mới để đổi mật khẩu (tùy chọn)
        public string? MatKhauCu { get; set; }
        public string? MatKhauMoi { get; set; }
    }
}
