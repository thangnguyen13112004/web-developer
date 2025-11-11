namespace Pharmacity.DTOs
{
    public class RegisterDto
    {
        public string HoTen { get; set; }
        public string Sdt { get; set; }
        public string MatKhau { get; set; }
    }

    public class LoginDto
    {
        public string Sdt { get; set; }
        public string MatKhau { get; set; }
    }
}
